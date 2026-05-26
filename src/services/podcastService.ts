import api from "../lib/api";
import {
  PodcastCategory,
  PodcastCategoryGroup,
  PodcastCategoryItem,
  PodcastEpisode,
} from "../types/podcast";

type PodcastApiItem = {
  id?: string | number;
  title?: string;
  name?: string;
  categoryId?: string | number;
  category?: string;
  categoryName?: string;
  topic?: string;
  coverUrl?: string;
  coverImageUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  audioUri?: string;
  mediaUrl?: string;
  fileUrl?: string;
  url?: string;
  transcript?: string;
  transcription?: string;
  content?: string;
  description?: string;
  summary?: string;
  durationLabel?: string;
  duration?: string | number;
  durationSeconds?: number;
  durationInSeconds?: number;
};

type PodcastCategoryApiItem =
  | string
  | {
      id?: string | number;
      name?: string;
      title?: string;
      category?: string;
      categoryName?: string;
      slug?: string;
    };

type PodcastsApiResponse =
  | PodcastApiItem[]
  | {
      podcasts?: PodcastApiItem[];
      items?: PodcastApiItem[];
      data?: PodcastApiItem[];
      episodes?: PodcastApiItem[];
      categories?: PodcastCategoryApiItem[];
      podcastCategories?: PodcastCategoryApiItem[];
    };

const fallbackCoverImage = "/assets/podcast_image.png";

function normalizeText(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeCategory(rawCategory?: string): PodcastCategory | null {
  if (!rawCategory?.trim()) {
    return null;
  }

  return rawCategory.trim();
}

function formatDurationLabel(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function resolveDurationLabel(item: PodcastApiItem) {
  if (typeof item.durationLabel === "string" && item.durationLabel.trim()) {
    return item.durationLabel.trim();
  }

  if (typeof item.duration === "string" && item.duration.trim()) {
    return item.duration.trim();
  }

  const seconds =
    typeof item.durationSeconds === "number"
      ? item.durationSeconds
      : typeof item.durationInSeconds === "number"
        ? item.durationInSeconds
        : typeof item.duration === "number"
          ? item.duration
          : null;

  if (typeof seconds === "number" && Number.isFinite(seconds)) {
    return formatDurationLabel(seconds);
  }

  return "--:--";
}

function resolveMediaUrl(url?: string) {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const baseUrl = api.defaults.baseURL;
  if (!baseUrl) {
    return url;
  }

  return new URL(url, baseUrl).toString();
}

function mapPodcastItem(item: PodcastApiItem): PodcastEpisode | null {
  const id = item.id != null ? String(item.id) : "";
  const title = item.title?.trim() || item.name?.trim() || "";
  const category = normalizeCategory(item.category || item.categoryName || item.topic);
  const categoryId = item.categoryId != null ? String(item.categoryId) : undefined;
  const audioUrl = resolveMediaUrl(
    item.audioUrl || item.audioUri || item.mediaUrl || item.fileUrl || item.url
  );

  if (!id || !title || !category || !audioUrl) {
    return null;
  }

  const coverUrl = resolveMediaUrl(
    item.coverUrl || item.coverImageUrl || item.imageUrl || item.thumbnailUrl
  );

  return {
    id,
    title,
    category,
    categoryId,
    coverImage: coverUrl || fallbackCoverImage,
    audioSource: audioUrl,
    durationLabel: resolveDurationLabel(item),
    transcript:
      item.transcript ||
      item.transcription ||
      item.content ||
      "Transcrição indisponível para este episódio.",
    description: item.description || item.summary,
  };
}

function mapCategoryItem(item: PodcastCategoryApiItem): PodcastCategoryItem | null {
  if (typeof item === "string") {
    const name = normalizeCategory(item);

    if (!name) {
      return null;
    }

    return {
      id: normalizeText(name),
      name,
    };
  }

  const name = normalizeCategory(
    item.name || item.title || item.category || item.categoryName || item.slug
  );
  const id =
    item.id != null ? String(item.id) : item.slug?.trim() || (name ? normalizeText(name) : "");

  if (!name || !id) {
    return null;
  }

  return {
    id,
    name,
  };
}

function extractPodcastItems(payload: PodcastsApiResponse): PodcastApiItem[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.episodes)) {
    return payload.episodes;
  }

  if (Array.isArray(payload.podcasts)) {
    return payload.podcasts;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function extractCategoriesFromPayload(payload?: PodcastsApiResponse) {
  if (!payload || Array.isArray(payload)) {
    return [];
  }

  const rawCategories = Array.isArray(payload.categories)
    ? payload.categories
    : Array.isArray(payload.podcastCategories)
      ? payload.podcastCategories
      : [];

  return rawCategories
    .map(mapCategoryItem)
    .filter((category): category is PodcastCategoryItem => Boolean(category));
}

export async function fetchPodcastCategoryGroups(): Promise<PodcastCategoryGroup[]> {
  const response = await api.get<PodcastsApiResponse>("/podcasts");
  const categoriesFromPayload = extractCategoriesFromPayload(response.data);
  const episodes = extractPodcastItems(response.data)
    .map(mapPodcastItem)
    .filter((episode): episode is PodcastEpisode => Boolean(episode));
  const groupedEpisodes = new Map<string, PodcastCategoryGroup>();

  categoriesFromPayload.forEach((category) => {
    if (groupedEpisodes.has(category.id)) {
      return;
    }

    groupedEpisodes.set(category.id, {
      category,
      episodes: [],
    });
  });

  episodes.forEach((episode) => {
    const categoryKey = episode.categoryId || normalizeText(episode.category);
    const currentGroup = categoryKey ? groupedEpisodes.get(categoryKey) : undefined;

    if (currentGroup) {
      currentGroup.episodes.push(episode);
      return;
    }

    groupedEpisodes.set(categoryKey || episode.id, {
      category: {
        id: categoryKey || episode.id,
        name: episode.category,
      },
      episodes: [episode],
    });
  });

  return [...groupedEpisodes.values()];
}
