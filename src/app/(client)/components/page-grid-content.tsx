"use client";

import Image from "next/image";
import Link from "next/link";
import image from "../../../../public/hero/banner2.jpg";
import { useLanguage } from "@/components/providers/language-provider";

const CARDS = [
  {
    href: "/article/1",
    imageSrc: image,
    titleKey: "pageTeasers.article1Title" as const,
    altKey: "pageTeasers.gridImageAlt" as const,
  },
  {
    href: "/article/2",
    imageSrc: "https://jamaat-e-islami.org/article_image/l/62_talk%20bji.jpg",
    titleKey: "pageTeasers.article2Title" as const,
    altKey: "pageTeasers.gridImageAlt" as const,
  },
  {
    href: "/article/3",
    imageSrc: "https://jamaat-e-islami.org/article_image/l/31_parliam.jpg",
    titleKey: "pageTeasers.article3Title" as const,
    altKey: "pageTeasers.gridImageAlt" as const,
  },
] as const;

export function PageGridContent() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {CARDS.map((card) => (
        <div
          key={card.href}
          className="flex flex-col gap-3 border-b-4 border-[#5bc0de] px-3 py-4 shadow-sm shadow-gray-400"
        >
          <Link href={card.href}>
            <div className="flex flex-col justify-between gap-3">
              <div className="w-full">
                <Image
                  src={card.imageSrc}
                  alt={t(card.altKey)}
                  className="h-[200px] w-full object-cover"
                  width={100}
                  height={100}
                />
              </div>
              <h1 className="cursor-pointer text-xl hover:underline">{t(card.titleKey)}</h1>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
