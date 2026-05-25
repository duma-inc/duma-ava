import { LessonBook } from '../types/lesson';

export const mockLessons: LessonBook[] = [
  {
    id: 'lesson-book-foundations',
    lessonId: '00000000-0000-0000-0000-000000000001',
    title: 'English Foundations',
    subtitle: 'Introdução guiada com leitura, vocabulário e exemplos visuais.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    chapters: [
      {
        id: 'foundations-chapter-1',
        order: 1,
        title: 'Chapter 1 · Introductions',
        summary: 'Apresentações básicas, greetings e construção de frases curtas.',
        markdown: `# Introductions

Welcome to the first chapter of **English Foundations**.

![Students greeting each other](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80)

## Core expressions

- Hello
- Good morning
- My name is...
- Nice to meet you

## Small dialogue

**Emma:** Hello, my name is Emma.  
**Lucas:** Nice to meet you, Emma.

## Study note

Use short sentences first. Clarity is more important than speed when you are building confidence.
`,
      },
      {
        id: 'foundations-chapter-2',
        order: 2,
        title: 'Chapter 2 · Family and Daily Context',
        summary: 'Vocabulário de família, idade e perguntas simples do dia a dia.',
        markdown: `# Family and Daily Context

Talking about family is a practical way to expand your vocabulary.

![Family speaking together](https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80)

## Useful patterns

- I have one brother.
- My mother is fifty years old.
- She is a student.
- He is a teacher.

## Remember

> Repetition builds familiarity.

## Practice ideas

1. Say the age of two relatives.
2. Describe one person using **he** or **she**.
3. Repeat the same sentences aloud twice.
`,
      },
      {
        id: 'foundations-chapter-3',
        order: 3,
        title: 'Chapter 3 · Numbers and Routine Practice',
        summary: 'Contagem, uso funcional de números e criação de uma rotina curta de treino.',
        markdown: `# Numbers and Routine Practice

Numbers are essential in time, age, prices, and schedules.

![Notebook with study plan](https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80)

## Count from 1 to 10

One, two, three, four, five, six, seven, eight, nine, ten.

## Why this matters

Learning numbers helps you:

- ask and answer about age
- understand prices
- follow dates and times

## Final tip

Create a **5-minute daily routine** with reading, speaking, and listening.
`,
      },
    ],
  },
  {
    id: 'lesson-book-conversation',
    lessonId: '00000000-0000-0000-0000-000000000002',
    title: 'Conversation Builder',
    subtitle: 'Capítulos focados em fluência básica, leitura guiada e organização da fala.',
    pdfUrl: 'https://www.orimi.com/pdf-test.pdf',
    chapters: [
      {
        id: 'conversation-chapter-1',
        order: 1,
        title: 'Chapter 1 · Asking Questions',
        summary: 'Estruturas simples para perguntar nome, origem, rotina e preferências.',
        markdown: `# Asking Questions

Questions create movement in a conversation.

![Person asking a question in class](https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80)

## Basic questions

- What is your name?
- Where are you from?
- What do you study?
- What do you like?

## Good habit

Ask one question, listen carefully, and answer with one full sentence.
`,
      },
      {
        id: 'conversation-chapter-2',
        order: 2,
        title: 'Chapter 2 · Useful Connectors',
        summary: 'Palavras de conexão para deixar a fala mais natural e organizada.',
        markdown: `# Useful Connectors

Connectors make your ideas sound more complete.

![Open book on a desk](https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=80)

## Examples

- and
- but
- because
- also
- then

## Example sentence

I study English **because** I want to communicate better.

## Reflection

Try to connect two short ideas instead of speaking in isolated words.
`,
      },
      {
        id: 'conversation-chapter-3',
        order: 3,
        title: 'Chapter 3 · Reading for Confidence',
        summary: 'Leitura curta com foco em ritmo, compreensão e segurança para falar.',
        markdown: `# Reading for Confidence

Reading aloud helps pronunciation and rhythm.

![Reading practice session](https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80)

## Reading strategy

1. Read slowly once.
2. Read again with more rhythm.
3. Mark the words you want to review later.

## Key idea

Confidence grows when the material feels familiar.

**Short, repeated reading sessions** are more effective than long, irregular study blocks.
`,
      },
    ],
  },
];
