"use client";

import { ChevronUp } from "lucide-react";

export function FooterScrollTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full border border-sky-400/50 bg-[#0c2847] text-white shadow-lg shadow-sky-500/25 transition hover:bg-[#0f3254] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]"
      aria-label="Scroll to top"
    >
      <ChevronUp className="size-6" strokeWidth={2.5} />
    </button>
  );
}
