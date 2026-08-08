"use client";

import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import {
  CONSTITUTION_SECTIONS,
  getConstitutionBlocks,
  getConstitutionTitle,
  type ConstitutionSectionId,
} from "@/data/constitution-content";
import { cn } from "@/lib/utils";

const NAVY = "#0b3a66";

export function ConstitutionView() {
  const { lang } = useLanguage();
  const [activeId, setActiveId] = useState<ConstitutionSectionId>(
    CONSTITUTION_SECTIONS[0]?.id ?? "preamble",
  );

  const active =
    CONSTITUTION_SECTIONS.find((s) => s.id === activeId) ??
    CONSTITUTION_SECTIONS[0];

  if (!active) return null;

  const title = getConstitutionTitle(active, lang);
  const blocks = getConstitutionBlocks(active, lang);

  return (
    <div className="bg-[#eaf2f8]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-3 py-8 sm:px-4 sm:py-10 lg:flex-row lg:items-start lg:gap-7">
        {/* Sidebar TOC */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64 xl:w-72">
          <nav
            aria-label="Constitution sections"
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"
          >
            <ul className="flex flex-col gap-1">
              {CONSTITUTION_SECTIONS.map((section) => {
                const label = getConstitutionTitle(section, lang);
                const isActive = section.id === activeId;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(section.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[15px] leading-snug transition-colors",
                        isActive
                          ? "font-semibold text-[#0b3a66]"
                          : "font-medium text-[#0b3a66]/90 hover:bg-[#0b3a66]/5",
                      )}
                    >
                      <span
                        className="mt-0.5 size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: NAVY }}
                        aria-hidden
                      />
                      <span>{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content card */}
        <section className="min-w-0 flex-1">
          <article className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
            <header
              className="px-4 py-3.5 text-center sm:px-6 sm:py-4"
              style={{ backgroundColor: NAVY }}
            >
              <h2 className="text-lg font-semibold tracking-wide text-white sm:text-xl">
                {title}
              </h2>
            </header>

            <div className="space-y-4 px-4 py-6 sm:px-8 sm:py-8 md:px-10">
              {blocks.map((block, index) => {
                const trimmed = block.trim();
                const isHeading =
                  trimmed.length < 100 &&
                  /^(article\s+\d+|chapter\s+|appendix|পূর্বকথা|ভূমিকা|ধারা-?\d+|প্রথম অধ্যায়|দ্বিতীয় অধ্যায়|তৃতীয় অধ্যায়|চতুর্থ|পঞ্চম|ষষ্ঠ|সপ্তম|নাম|মৌলিক আকীদাহ|উদ্দেশ্য|স্থায়ী|দাওয়াহ|সদস্যপদ|মহিলা সদস্য|সমর্থক|কেন্দ্রীয়|শাখা|উপ-শাখা|বাইতুলমাল|নির্বাচন|পদ থেকে|গঠনতন্ত্র|পরিশিষ্ট|ব্যাখ্যা|제\s*\d+\s*조|제\s*\d+\s*장|부록|전문|이름|명칭|중앙|지부|회원|여성|A\.\s|B\.\s|Name|Fundamental|Objectives|Permanent|Da'wah|Membership|Duties|Eligibility|Supporter|Central|Branch|Women|Baitul|Election|Removal|Limits|Interpretation|Amendment|Oath|Information|Explanation)/i.test(
                    trimmed,
                  );

                if (isHeading) {
                  return (
                    <h3
                      key={`${active.id}-${index}`}
                      className="pt-2 text-base font-semibold text-[#0b3a66] sm:text-lg"
                    >
                      {block}
                    </h3>
                  );
                }

                return (
                  <p
                    key={`${active.id}-${index}`}
                    className="text-[15px] leading-8 text-neutral-800 sm:text-base sm:leading-8"
                  >
                    {block}
                  </p>
                );
              })}
            </div>

            <div className="border-t border-neutral-200" />
          </article>
        </section>
      </div>
    </div>
  );
}
