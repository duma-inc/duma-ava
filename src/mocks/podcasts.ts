import { PodcastCategory, PodcastEpisode } from '../types/podcast';

const coverImage = '/assets/podcast_image.png';
const audioSource = '/assets/audios/podcast_episode01.wav';

const transcript = `Opening
Emma: Hello! Good morning!
Lucas: Hi, Emma! Good morning! How are you?
Emma: I'm fine, thank you! And you?
Lucas: I'm great! My name is Lucas. What's your name?
Emma: My name is Emma. Nice to meet you!
Lucas: Nice to meet you too! Today, we are going to talk about ourselves.
Emma: Yes! Let's introduce ourselves and talk about our ages!

Main Conversation Part 1: Introductions
Lucas: Emma, tell me about yourself. Are you a student?
Emma: Yes, I am a student. I study English. And you, Lucas? Are you a student too?
Lucas: Yes, I am! I am a teacher and a student. I teach math and I study English.
Emma: That's interesting! How old are you, Lucas?
Lucas: I am 28 years old. And you? How old are you?
Emma: I am 25 years old. We are young!
Lucas: (laughs) Yes, we are! Do you have brothers or sisters?
Emma: Yes, I have one brother and one sister. My brother is 22 years old. My sister is 15 years old. She is very young!
Lucas: That's nice! I have one brother. He is 30 years old.

Main Conversation Part 2: Family & Numbers
Emma: Lucas, how old is your mother?
Lucas: My mother is 55 years old, and my father is 58 years old. They are happy!
Emma: That's wonderful! My mother is 50 years old. My father is 52 years old.
Lucas: Great! Now, let's practice some numbers. Can you count from 1 to 10?
Emma: Of course! One, two, three, four, five, six, seven, eight, nine, ten!
Lucas: Perfect! Now, let's count by tens: Ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred!
Emma: Excellent! Numbers are important in English!
Lucas: Yes! We use numbers every day. For shopping, for time, for age...
Emma: That's right! And it's easy to learn!

Closing & Practice
Lucas: Now, dear listeners, it's YOUR turn to practice!
Emma: Yes! First, introduce yourself. Say: "Hello, my name is..." and "I am ___ years old."
Lucas: Good! Then, talk about your family. Say: "My mother is years old" or "My brother is years old."
Emma: Remember to use "I am" for yourself, "He is" for a man, and "She is" for a woman!
Lucas: Practice counting from 1 to 20 every day. Then 1 to 100!
Emma: It's easy! Just practice a little every day.
Lucas: Thank you for listening, everyone!
Emma: Goodbye! Have a nice day!
Both: Bye-bye!`;

export const podcastCategories: PodcastCategory[] = [
  'Contos',
  'Ciências',
  'História',
  'Cultura',
  'Conselhos',
];

const episodeBase = {
  coverImage,
  audioSource,
  durationLabel: '06:24',
  transcript,
};

export const podcastEpisodesByCategory: Record<PodcastCategory, PodcastEpisode[]> = {
  Contos: [
    {
      ...episodeBase,
      id: 'contos-opening-connections',
      category: 'Contos',
      title: 'Opening Connections',
      description: 'Um diálogo leve para praticar apresentações e vocabulário cotidiano.',
    },
    {
      ...episodeBase,
      id: 'contos-family-counting',
      category: 'Contos',
      title: 'Family and Counting',
      description: 'Reforço de números, idade e relações familiares em inglês.',
    },
  ],
  Ciências: [
    {
      ...episodeBase,
      id: 'ciencias-everyday-language',
      category: 'Ciências',
      title: 'The Science of Everyday Language',
      description: 'Mock de episódio para validar categorias e navegação.',
    },
  ],
  História: [
    {
      ...episodeBase,
      id: 'historia-speaking-through-time',
      category: 'História',
      title: 'Speaking Through Time',
      description: 'Narrativa introdutória com foco em escuta e leitura guiada.',
    },
  ],
  Cultura: [
    {
      ...episodeBase,
      id: 'cultura-hello-around-the-world',
      category: 'Cultura',
      title: 'Hello Around the World',
      description: 'Expressões básicas e apresentação pessoal em contexto cultural.',
    },
  ],
  Conselhos: [
    {
      ...episodeBase,
      id: 'conselhos-practice-every-day',
      category: 'Conselhos',
      title: 'Practice Every Day',
      description: 'Dicas simples para criar rotina de treino com áudio e leitura.',
    },
  ],
};
