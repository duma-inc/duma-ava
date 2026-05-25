import api from '../lib/api';
import { VideoCatalogResponse, VideoCategory, VideoItem } from '../types/video';

type VideoApiItem = {
  id?: string | number;
  title?: string;
  category?: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  durationLabel?: string;
  description?: string;
};

type RawVideoCatalogResponse =
  | VideoApiItem[]
  | {
      categories?: string[];
      videos?: VideoApiItem[];
      items?: VideoApiItem[];
      data?: VideoApiItem[];
    };

function normalizeCategory(value?: string): VideoCategory | null {
  if (!value?.trim()) {
    return null;
  }
  return value.trim();
}

function mapVideoItem(item: VideoApiItem): VideoItem | null {
  const id = item.id != null ? String(item.id) : '';
  const title = item.title?.trim() || '';
  const category = normalizeCategory(item.category);
  const embedUrl = item.embedUrl?.trim() || '';
  const thumbnailUrl = item.thumbnailUrl?.trim() || '';
  const durationLabel = item.durationLabel?.trim() || '--:--';

  if (!id || !title || !category || !embedUrl) {
    return null;
  }

  return {
    id,
    title,
    category,
    embedUrl,
    thumbnailUrl,
    durationLabel,
    description: item.description?.trim() || undefined,
  };
}

function extractVideoItems(payload: RawVideoCatalogResponse): VideoApiItem[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.videos)) {
    return payload.videos;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

export async function fetchVideoCatalog(): Promise<VideoCatalogResponse> {
  const response = await api.get<RawVideoCatalogResponse>('/videos');
  const items = extractVideoItems(response.data)
    .map(mapVideoItem)
    .filter((item): item is VideoItem => Boolean(item));

  const categoriesFromPayload = Array.isArray((response.data as { categories?: string[] })?.categories)
    ? ((response.data as { categories?: string[] }).categories || []).map(normalizeCategory).filter((item): item is string => Boolean(item))
    : [];

  const fallbackCategories = Array.from(new Set(items.map((item) => item.category)));
  const categories = categoriesFromPayload.length > 0 ? categoriesFromPayload : fallbackCategories;

  return {
    categories,
    videos: items,
  };
}
