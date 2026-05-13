"use client";

import Image from "next/image";
import image from "../../../../public/hero/banner2.jpg";
import { useLanguage } from "@/components/providers/language-provider";

const POLL_OPTIONS = [
  { id: "sidebar-poll-def-yes", key: "pageSidebar.pollDefinitelyYes" as const },
  { id: "sidebar-poll-yes", key: "pageSidebar.pollYes" as const },
  { id: "sidebar-poll-no", key: "pageSidebar.pollNo" as const },
  { id: "sidebar-poll-def-no", key: "pageSidebar.pollDefinitelyNo" as const },
] as const;

const ARTICLE_KEYS = [
  "pageSidebar.article1",
  "pageSidebar.article2",
  "pageSidebar.article3",
  "pageSidebar.article4",
  "pageSidebar.article5",
] as const;

const NEWS_KEYS = [
  "pageSidebar.news1",
  "pageSidebar.news2",
  "pageSidebar.news3",
  "pageSidebar.news4",
] as const;

export function PageSidebar() {
  const { t } = useLanguage();

  return (
    <div className="border-1 p-2 shadow-sm shadow-gray-400">
      <section>
        <h2 className="bg-[#0a1628] p-3 text-lg text-white">
          {t("pageSidebar.pollTitle")}
        </h2>
        <div className="bg-[#5bc0de] p-3">
          <p className="pb-4 text-xl">{t("pageSidebar.pollQuestion")}</p>
          {POLL_OPTIONS.map((opt) => (
            <div key={opt.id} className="flex gap-2 pb-1">
              <input type="radio" name="sidebar-poll" id={opt.id} />
              <label className="text-lg" htmlFor={opt.id}>
                {t(opt.key)}
              </label>
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            <button type="button" className="rounded-sm bg-blue-500 p-2 text-white">
              {t("pageSidebar.voteButton")}
            </button>
            <button type="button" className="rounded-sm bg-[#0a1628] p-2 text-white">
              {t("pageSidebar.resultButton")}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-sm">
        <h2 className="bg-[#0a1628] p-3 text-lg text-white">
          {t("pageSidebar.notableArticlesTitle")}
        </h2>
        <div className="flex flex-col gap-2 space-y-4 bg-[#5bc0de] px-4 py-6">
          {ARTICLE_KEYS.map((key) => (
            <a key={key} href="#" className="text-xl hover:underline">
              {t(key)}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-sm">
        <h2 className="bg-[#0a1628] p-3 text-lg text-white">
          {t("pageSidebar.notableNewsTitle")}
        </h2>
        <div className="flex flex-col gap-2 space-y-4 bg-[#5bc0de] px-4 py-6">
          {NEWS_KEYS.map((key) => (
            <a key={key} href="#" className="text-xl hover:underline">
              {t(key)}
            </a>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-sm">
        <h2 className="bg-[#0a1628] p-3 text-lg text-white">
          {t("pageSidebar.notableVideosTitle")}
        </h2>
        <div className="flex flex-col gap-2 space-y-4 bg-[#5bc0de] px-4 py-6">
          <Image
            src={image}
            alt={t("pageSidebar.featuredMediaAlt")}
            className="h-auto w-full"
          />
        </div>
      </section>

      <section className="mt-4 rounded-sm">
        <h2 className="bg-[#0a1628] p-3 text-lg text-white">
          {t("pageSidebar.notablePhotosTitle")}
        </h2>
        <div className="flex flex-col gap-2 space-y-4 bg-[#5bc0de] px-4 py-6">
          <Image
            src={image}
            alt={t("pageSidebar.featuredMediaAlt")}
            className="h-auto w-full"
          />
        </div>
      </section>
    </div>
  );
}
