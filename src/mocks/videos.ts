import { VideoCategory, VideoItem } from '../types/video';

function parseCloudinaryEmbed(url: string) {
  try {
    const parsed = new URL(url);
    const cloudName = parsed.searchParams.get('cloud_name');
    const publicId = parsed.searchParams.get('public_id');

    if (!cloudName || !publicId) {
      return null;
    }

    return {
      cloudName,
      publicId,
    };
  } catch {
    return null;
  }
}

function buildThumbnailUrl(url: string) {
  const cloudinaryData = parseCloudinaryEmbed(url);

  if (!cloudinaryData) {
    return '';
  }

  const { cloudName, publicId } = cloudinaryData;
  return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.jpg`;
}

function createVideoItem(item: Omit<VideoItem, 'thumbnailUrl'>): VideoItem {
  return {
    ...item,
    thumbnailUrl: buildThumbnailUrl(item.embedUrl),
  };
}

export const videoCategories: VideoCategory[] = ['Aulas', 'Extras'];

export const videosByCategory: Record<VideoCategory, VideoItem[]> = {
  Aulas: [
    createVideoItem({
      id: 'aulas-root-lesson-7',
      title: 'Root Lesson 7',
      category: 'Aulas',
      embedUrl: 'https://player.cloudinary.com/embed/?cloud_name=drhybgfng&public_id=root-lesson7-2026-03-18_19.55.15_cv8hls',
      durationLabel: '08:14',
      description: 'Aula principal hospedada no Cloudinary para reprodução embutida estável dentro do app.',
    }),
  ],
  Extras: [
    createVideoItem({
      id: 'extras-leaf-lesson-01',
      title: 'Leaf Lesson 01',
      category: 'Extras',
      embedUrl: 'https://player.cloudinary.com/embed/?cloud_name=drhybgfng&public_id=leaf-lesson01-2026-02-20_00.05.18_eblcbb',
      durationLabel: '05:47',
      description: 'Conteúdo complementar em Cloudinary para validar o fluxo de vídeos fora do YouTube.',
    }),
  ],
};
