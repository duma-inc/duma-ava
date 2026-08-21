import { SPOKEN_CONTENT_LANGUAGE } from "@/types/exercise";

/**
 * Escolhe a melhor voz em ingles disponivel no navegador.
 *
 * Definir so `utterance.lang` deixa a escolha para o navegador, que costuma cair
 * na primeira voz do idioma — no Linux normalmente o eSpeak, bem robotico. Os
 * navegadores tambem expoem vozes de rede (as "Google ..." no Chrome) e as
 * premium do sistema, bem mais naturais; e essas que preferimos aqui.
 *
 * Diferente do mobile, a Web Speech API nao tem campo de qualidade, entao a
 * escolha e heuristica: voz de rede (`localService === false`) e nomes conhecidos
 * de vozes neurais pesam mais.
 */

const BASE_LANG = SPOKEN_CONTENT_LANGUAGE.split("-")[0].toLowerCase(); // 'en'

/** Marcas presentes nos nomes das vozes neurais/premium dos principais sistemas. */
const HIGH_QUALITY_HINTS = /google|natural|neural|enhanced|premium|siri|samantha/i;

function normalizeLang(lang: string) {
  return (lang || "").toLowerCase().replace("_", "-");
}

function score(voice: SpeechSynthesisVoice) {
  let s = 0;
  // Vozes de rede sao quase sempre melhores que as locais comprimidas.
  if (!voice.localService) s += 10;
  if (HIGH_QUALITY_HINTS.test(voice.name || "")) s += 6;

  const lang = normalizeLang(voice.lang);
  if (lang === SPOKEN_CONTENT_LANGUAGE.toLowerCase()) s += 4;
  else if (lang.startsWith(BASE_LANG)) s += 2;

  if (voice.default) s += 1;
  return s;
}

/**
 * O Chrome popula as vozes de forma assincrona: a primeira chamada a
 * `getVoices()` costuma voltar vazia ate o evento `voiceschanged`.
 */
function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) {
      resolve(immediate);
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.speechSynthesis.removeEventListener("voiceschanged", finish);
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener("voiceschanged", finish);
    // Alguns navegadores nunca disparam o evento; nao vale travar o audio por isso.
    window.setTimeout(finish, 1000);
  });
}

let cache: Promise<SpeechSynthesisVoice | undefined> | null = null;

export function resolveSpokenVoice(): Promise<SpeechSynthesisVoice | undefined> {
  if (!cache) {
    cache = (async () => {
      const voices = await getVoices();
      const candidates = voices.filter((v) => normalizeLang(v.lang).startsWith(BASE_LANG));
      if (candidates.length === 0) return undefined;
      return candidates.reduce((a, b) => (score(b) > score(a) ? b : a));
    })();
  }
  return cache;
}

/**
 * Monta o utterance do conteudo do curso ja com o idioma certo e a melhor voz
 * disponivel. Sem voz adequada, o navegador decide pelo `lang` — comportamento antigo.
 */
export async function createSpokenUtterance(
  text: string,
  options: { pitch?: number; rate?: number } = {}
): Promise<SpeechSynthesisUtterance> {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPOKEN_CONTENT_LANGUAGE;
  if (options.pitch !== undefined) utterance.pitch = options.pitch;
  if (options.rate !== undefined) utterance.rate = options.rate;

  const voice = await resolveSpokenVoice();
  if (voice) utterance.voice = voice;

  return utterance;
}
