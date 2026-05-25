import { SentenceBuilderPack } from '../types/game';

export const sentenceBuilderPacks: SentenceBuilderPack[] = [
  {
    id: 'sentence-builder-week-1',
    title: 'Sentence Builder',
    weekLabel: 'Semana 1',
    description: 'Frases curtas para aquecer a leitura e a organização da estrutura básica.',
    sentences: [
      {
        id: 'sb-w1-1',
        prompt: 'Monte a frase de apresentação.',
        sentence: 'My name is Emma',
      },
      {
        id: 'sb-w1-2',
        prompt: 'Organize a frase sobre estudo.',
        sentence: 'I study English every day',
      },
      {
        id: 'sb-w1-3',
        prompt: 'Monte a frase com uma rotina simples.',
        sentence: 'We practice together after class',
      },
    ],
  },
  {
    id: 'sentence-builder-week-2',
    title: 'Sentence Builder',
    weekLabel: 'Semana 2',
    description: 'Mais frases com conectores, rotina e vocabulário funcional.',
    sentences: [
      {
        id: 'sb-w2-1',
        prompt: 'Monte a frase com horário.',
        sentence: 'The lesson starts at eight',
      },
      {
        id: 'sb-w2-2',
        prompt: 'Organize a frase com conector.',
        sentence: 'I read slowly because I want accuracy',
      },
      {
        id: 'sb-w2-3',
        prompt: 'Monte a frase de planejamento.',
        sentence: 'They review vocabulary before dinner',
      },
      {
        id: 'sb-w2-4',
        prompt: 'Organize a frase com ação em grupo.',
        sentence: 'Our team writes sentences in order',
      },
    ],
  },
  {
    id: 'sentence-builder-week-3',
    title: 'Sentence Builder',
    weekLabel: 'Semana 3',
    description: 'Pacote semanal maior, com frases mais longas para reforçar ritmo e precisão.',
    sentences: [
      {
        id: 'sb-w3-1',
        prompt: 'Monte a frase sobre rotina de estudo.',
        sentence: 'She listens to the podcast before work',
      },
      {
        id: 'sb-w3-2',
        prompt: 'Organize a frase com prática diária.',
        sentence: 'We build confidence with short daily exercises',
      },
      {
        id: 'sb-w3-3',
        prompt: 'Monte a frase sobre progresso.',
        sentence: 'The student completes one chapter each night',
      },
      {
        id: 'sb-w3-4',
        prompt: 'Organize a frase com colaboração.',
        sentence: 'My classmates help me remember difficult words',
      },
      {
        id: 'sb-w3-5',
        prompt: 'Monte a frase final.',
        sentence: 'Practice becomes easier when the structure is clear',
      },
    ],
  },
];
