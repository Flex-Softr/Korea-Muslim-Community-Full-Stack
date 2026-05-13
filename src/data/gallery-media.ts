import type { LocaleContentMap } from "@/lib/i18n/content-locale";

export type PhotoGalleryItem = {
  id: string;
  category: string;
  title: string;
  caption: string;
  imageSrc: string;
  gridClass: string;
  minHClass: string;
  dateIso: string;
  /** Present for dashboard-backed items — used client-side when switching UI language. */
  localeContent?: LocaleContentMap | null;
};

export type VideoGalleryItem = {
  id: string;
  category: string;
  title: string;
  thumbClass: string;
  embedUrl: string;
  caption?: string;
  dateIso: string;
  /** Present for dashboard-backed items — used client-side when switching UI language. */
  localeContent?: LocaleContentMap | null;
};

export const PHOTO_GALLERY_ITEMS: PhotoGalleryItem[] = [];

export const VIDEO_GALLERY_ITEMS: VideoGalleryItem[] = [];
