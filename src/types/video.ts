export type VideoCategory = string;

export interface VideoItem {
  id: string;
  title: string;
  category: VideoCategory;
  embedUrl: string;
  thumbnailUrl: string;
  durationLabel: string;
  description?: string;
  externalUrl?: string;
}

export interface VideoCatalogResponse {
  categories: VideoCategory[];
  videos: VideoItem[];
}
