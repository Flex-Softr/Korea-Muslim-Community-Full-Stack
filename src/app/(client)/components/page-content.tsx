"use client";

import Image from "next/image";
import image from "../../../../public/hero/banner2.jpg";
import { useLanguage } from "@/components/providers/language-provider";

const BLOCKS = [
  {
    imageSrc: image,
    titleKey: "pageTeasers.article1Title" as const,
    excerptKey: "pageTeasers.article1Excerpt" as const,
    altKey: "pageTeasers.gridImageAlt" as const,
  },
  {
    imageSrc: "https://jamaat-e-islami.org/article_image/l/62_talk%20bji.jpg",
    titleKey: "pageTeasers.article2Title" as const,
    excerptKey: "pageTeasers.article2Excerpt" as const,
    altKey: "pageTeasers.gridImageAlt" as const,
  },
  {
    imageSrc: "https://jamaat-e-islami.org/article_image/l/31_parliam.jpg",
    titleKey: "pageTeasers.article3Title" as const,
    excerptKey: "pageTeasers.article3Excerpt" as const,
    altKey: "pageTeasers.gridImageAlt" as const,
  },
] as const;

export function PageContent() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4">
      {BLOCKS.map((block) => (
        <div
          key={block.titleKey}
          className="flex flex-col gap-3 border-b-4 border-[#5bc0de] px-3 py-4 shadow-sm shadow-gray-400"
        >
          <h1 className="cursor-pointer text-3xl hover:underline">{t(block.titleKey)}</h1>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full md:w-1/3">
              <Image
                src={block.imageSrc}
                alt={t(block.altKey)}
                className="h-auto w-full"
                width={100}
                height={100}
              />
            </div>
            <p className="line-clamp-4 w-full text-lg md:w-2/3">{t(block.excerptKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
