export type PodcastCategory =
  | 'Contos'
  | 'Ciências'
  | 'História'
  | 'Cultura'
  | 'Conselhos';

export interface PodcastEpisode {
  id: string;
  title: string;
  category: PodcastCategory;
  coverImage: string;
  audioSource: string;
  durationLabel: string;
  transcript: string;
  description?: string;
}
