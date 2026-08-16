"use client";

import { useState } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import {
  ORGANIZATIONAL_METHOD_SECTIONS,
  getOrganizationalMethodBlocks,
  getOrganizationalMethodTitle,
  type OrganizationalMethodSectionId,
} from "@/data/organizational-method-content";
import { cn } from "@/lib/utils";

const NAVY = "#0b3a66";

const HEADING_PATTERN =
  /^(appendix|phase|preamble|working method|features|permanent|da'wah|organization|training|social|member|central|branch|sub-branch|supporter|worker|contact|ভূমিকা|কর্মপদ্ধতি|বিশেষত্ব|স্থায়ী|দাওয়াহ|প্রথম দফা|দ্বিতীয় দফা|তৃতীয় দফা|সংগঠন|প্রশিক্ষণ|সমাজ|সমর্থক|কর্মী|সদস্য|কেন্দ্রীয়|শাখা|উপশাখা|উপ-শাখা|পরিশিষ্ট|যাগাযোগ|যোগাযোগ|서문|업무|특징|상설|다와|제\s*[123]|조직|훈련|사회|회원|중앙|지부|분회|지지자|일꾼|부록)/i;

export function OrganizationalMethodView() {
  const { lang } = useLanguage();
  const [activeId, setActiveId] = useState<OrganizationalMethodSectionId>(
    ORGANIZATIONAL_METHOD_SECTIONS[0]?.id ?? "preamble",
  );

  const active =
    ORGANIZATIONAL_METHOD_SECTIONS.find(s => s.id === activeId) ??
    ORGANIZATIONAL_METHOD_SECTIONS[0];

  if (!active) return null;

  const title = getOrganizationalMethodTitle(active, lang);
  const blocks = getOrganizationalMethodBlocks(active, lang);

  return (
    <div className="bg-[#eaf2f8]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-3 py-8 sm:px-4 sm:py-10 lg:flex-row lg:items-start lg:gap-7">
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64 xl:w-72">
          <nav
            aria-label="Organizational method sections"
            className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"
          >
            <ul className="flex flex-col gap-1">
              {ORGANIZATIONAL_METHOD_SECTIONS.map(section => {
                const label = getOrganizationalMethodTitle(section, lang);
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
                  trimmed.length < 120 && HEADING_PATTERN.test(trimmed);

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
