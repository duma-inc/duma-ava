import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import { Exercise } from '../../types/exercise';

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface WindowWithSpeech {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

interface Props {
  exercise: Exercise;
  answered: boolean;
  isCorrect: boolean | null;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
}

export default function SpeakingExercise({ exercise, answered, isCorrect: isCorrectProp, selectedAnswer, onAnswer }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [showTypingFallback, setShowTypingFallback] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');

  const [prevExerciseId, setPrevExerciseId] = useState(exercise.id);

  // Sync state on exercise change during render
  if (exercise.id !== prevExerciseId) {
    setPrevExerciseId(exercise.id);
    setTranscript('');
    setTypedAnswer('');
    setIsRecording(false);
    setErrorMsg(null);
    setShowTypingFallback(false);
  }

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTimeout(() => {
        setIsSupported(false);
      }, 0);
    }
  }, []);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        try {
          recognition.abort();
        } catch {
          // Safe catch
        }
      }
    };
  }, [exercise.id]);

  const startRecording = () => {
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Reconhecimento de voz não é suportado neste navegador.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.lang = exercise.language || 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMsg(null);
        setTranscript('');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (event.results && event.results[0]) {
          const resultText = event.results[0][0].transcript;
          setTranscript(resultText);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition error:', event.error, event.message);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Permissão de microfone negada. Permita o microfone nas configurações do seu navegador.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('Nenhuma voz detectada. Tente falar novamente mais alto.');
        } else {
          setErrorMsg(`Erro de gravação: ${event.error}`);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    }
  };

  const handleConfirm = () => {
    const finalAnswer = showTypingFallback ? typedAnswer : transcript;
    if (finalAnswer.trim()) {
      onAnswer(finalAnswer.trim());
    }
  };

  const isCorrect = answered && isCorrectProp === true;

  return (
    <div className="flex flex-col gap-5">
      {/* Box de Instrução/Repetição */}
      <div className="bg-[#1C1C1C] rounded-2xl border border-[#7A4A12] p-6 flex flex-col items-center gap-3 text-center shadow-md">
        <MicrophoneIcon className="w-8 h-8 text-[#FDA91E]" />
        <span className="text-xs text-[#D88A00] font-bold uppercase tracking-wider">
          Repita a frase abaixo:
        </span>
        <p className="text-xl sm:text-2xl font-black text-[#F4E3C1] leading-relaxed max-w-lg select-none">
          {exercise.description}
        </p>
      </div>

      {!answered && (
        <div className="flex flex-col items-center gap-4">
          {!showTypingFallback ? (
            <>
              {/* Botão de Gravação */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 duration-200 select-none ${
                  isRecording
                    ? 'bg-red-600 text-white shadow-red-600/30 animate-pulse'
                    : 'bg-[#FDA91E] text-black shadow-[#FDA91E]/30 hover:brightness-110'
                }`}
              >
                {isRecording ? (
                  <StopIcon className="w-9 h-9" />
                ) : (
                  <MicrophoneIcon className="w-9 h-9" />
                )}
              </button>

              <span className={`text-sm font-bold tracking-wide transition-colors duration-200 ${
                isRecording ? 'text-red-500' : 'text-[#7A4A12]'
              }`}>
                {isRecording ? 'Gravando... Fale agora.' : 'Clique no microfone para falar'}
              </span>

              {errorMsg && (
                <div className="bg-[#3D1A1A] border border-[#F44336]/30 rounded-xl px-4 py-2.5 text-center max-w-md">
                  <p className="text-[#F44336] font-bold text-xs">{errorMsg}</p>
                </div>
              )}

              {/* Resultado Transcrito Temporário */}
              {transcript.length > 0 && (
                <div className="w-full bg-[#1C1C1C] border border-[#7A4A12]/30 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm">
                  <span className="text-[#D88A00] text-[11px] font-bold uppercase tracking-wider">Você disse:</span>
                  <p className="text-[#F4E3C1] text-base italic font-medium">
                    &quot;{transcript}&quot;
                  </p>
                </div>
              )}

              {/* Botão de Confirmação */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!transcript.trim() || !isSupported}
                className={`w-full py-4 rounded-xl border font-black text-base transition-all select-none active:scale-[0.98] ${
                  transcript.trim()
                    ? 'bg-[#FDA91E] border-[#D88A00] text-black cursor-pointer hover:brightness-105'
                    : 'bg-[#1C1C1C] border-[#1C1C1C] text-[#3A3A3A] cursor-not-allowed'
                }`}
              >
                Confirmar Resposta
              </button>

              {/* Toggle para Fallback Digitação ou Mensagem de Não Suportado */}
              {!isSupported ? (
                <div className="bg-[#3D1A1A] border border-[#F44336]/30 rounded-xl p-4 text-center max-w-md mt-2">
                  <p className="text-[#F44336] font-bold text-sm">O reconhecimento de voz não é suportado neste navegador.</p>
                  <button
                    type="button"
                    onClick={() => setShowTypingFallback(true)}
                    className="text-xs text-[#FDA91E] hover:underline font-bold mt-2 cursor-pointer"
                  >
                    Clique aqui para digitar a resposta em vez de falar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTypingFallback(true)}
                  className="text-xs text-primary-darker hover:text-[#FDA91E] transition-colors font-bold mt-2 cursor-pointer underline"
                >
                  Problemas com o microfone? Digite a frase
                </button>
              )}
            </>
          ) : (
            <div className="w-full flex flex-col gap-3">
              <span className="text-xs text-[#D88A00] font-bold uppercase tracking-wider self-start">
                Digite o que você falaria:
              </span>
              <textarea
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Digite a frase aqui..."
                className="w-full h-24 bg-[#1C1C1C] border border-[#7A4A12]/40 rounded-xl p-4 text-[#F4E3C1] placeholder:text-[#3A3A3A] focus:outline-none focus:border-[#FDA91E] transition-colors resize-none font-medium"
              />

              {/* Botão de Confirmação para Fallback */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!typedAnswer.trim()}
                className={`w-full py-4 rounded-xl border font-black text-base transition-all select-none active:scale-[0.98] ${
                  typedAnswer.trim()
                    ? 'bg-[#FDA91E] border-[#D88A00] text-black cursor-pointer hover:brightness-105'
                    : 'bg-[#1C1C1C] border-[#1C1C1C] text-[#3A3A3A] cursor-not-allowed'
                }`}
              >
                Confirmar Resposta Digitada
              </button>

              {isSupported && (
                <button
                  type="button"
                  onClick={() => setShowTypingFallback(false)}
                  className="text-xs text-primary-darker hover:text-[#FDA91E] transition-colors font-bold mt-1 cursor-pointer underline"
                >
                  Voltar para o microfone
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {answered && (
        <div
          className={`border-[1.5px] rounded-xl p-4 flex flex-col gap-2 ${
            isCorrect ? 'bg-[#1A3D1A] border-[#4CAF50]' : 'bg-[#3D1A1A] border-[#F44336]'
          }`}
        >
          <div className="flex flex-row items-center gap-2">
            <span className="text-xl leading-none font-bold text-inherit">
              {isCorrect ? '✓' : '✗'}
            </span>
            <span className={`font-extrabold text-base ${isCorrect ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
              {isCorrect ? 'Pronúncia registrada!' : 'Pronúncia incorreta'}
            </span>
          </div>
          <p className="text-[#D88A00] text-sm">
            Sua pronúncia:{' '}
            <span className="text-[#F4E3C1] font-semibold italic">
              &quot;{selectedAnswer}&quot;
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
