export type PodcastCategory = string;

export interface PodcastCategoryItem {
  id: string;
  name: PodcastCategory;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  category: PodcastCategory;
  categoryId?: string;
  coverImage: string;
  audioSource: string;
  durationLabel: string;
  transcript: string;
  description?: string;
}

export interface PodcastCategoryGroup {
  category: PodcastCategoryItem;
  episodes: PodcastEpisode[];
}
