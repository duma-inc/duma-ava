import { DumaQuizPack, SentenceBuilderPack } from '../types/game';

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

export const dumaQuizPacks: DumaQuizPack[] = [
  {
    id: 'duma-quiz-week-1',
    title: 'Duma Quiz',
    weekLabel: 'Semana 1',
    description: 'Perguntas básicas sobre vocabulário e gramática do nível iniciante.',
    questions: [
      {
        id: 'dq-w1-1',
        question: 'What is the correct translation of "Cachorro"?',
        options: ['Cat', 'Dog', 'Bird', 'Fish'],
        correctIndex: 1,
      },
      {
        id: 'dq-w1-2',
        question: 'Which sentence is correct?',
        options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She gone to school.'],
        correctIndex: 1,
      },
      {
        id: 'dq-w1-3',
        question: 'What does "beautiful" mean?',
        options: ['Feio', 'Grande', 'Bonito', 'Pequeno'],
        correctIndex: 2,
      },
      {
        id: 'dq-w1-4',
        question: 'Choose the correct plural of "child":',
        options: ['Childs', 'Childes', 'Children', 'Childrens'],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'duma-quiz-week-2',
    title: 'Duma Quiz',
    weekLabel: 'Semana 2',
    description: 'Verbos, tempos verbais e expressões do dia a dia.',
    questions: [
      {
        id: 'dq-w2-1',
        question: 'What is the past tense of "go"?',
        options: ['Goed', 'Goes', 'Went', 'Gone'],
        correctIndex: 2,
      },
      {
        id: 'dq-w2-2',
        question: 'How do you say "Eu estou estudando" in English?',
        options: ['I study.', 'I am studying.', 'I was studying.', 'I studied.'],
        correctIndex: 1,
      },
      {
        id: 'dq-w2-3',
        question: 'Which word means "rápido"?',
        options: ['Slow', 'Loud', 'Fast', 'Soft'],
        correctIndex: 2,
      },
      {
        id: 'dq-w2-4',
        question: 'Complete: "She ___ a doctor."',
        options: ['are', 'am', 'is', 'be'],
        correctIndex: 2,
      },
    ],
  },
];
