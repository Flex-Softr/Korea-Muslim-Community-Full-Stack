export type PhotoGalleryItem = {
  id: string;
  category: string;
  title: string;
  caption: string;
  imageSrc: string;
  gridClass: string;
  minHClass: string;
  dateIso: string;
};

export type VideoGalleryItem = {
  id: string;
  category: string;
  title: string;
  thumbClass: string;
  embedUrl: string;
  caption?: string;
  dateIso: string;
};

export const PHOTO_GALLERY_ITEMS: PhotoGalleryItem[] = [];

export const VIDEO_GALLERY_ITEMS: VideoGalleryItem[] = [];
