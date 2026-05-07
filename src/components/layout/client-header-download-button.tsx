"use client";

import { useState } from "react";
import Link from "next/link";

export function DownloadMenu() {
    const [open, setOpen] = useState(false);
  
    const items = [
      { label: "PDF", href: "/download/pdf" },
      { label: "eBook & Leaflet", href: "/download/ebook-leaflet" },
      { label: "Book", href: "/download/book" },
      { label: "Form", href: "/download/form" },
      { label: "Poster", href: "/download/poster" },
      { label: "Syllabus", href: "/download/syllabus" },
    ];
  
    return (
      <div className="relative">
        {/* Button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-5 py-2 rounded-sm 
          bg-[#0a1628] shadow-sm shadow-zinc-800/60 hover:bg-zinc-200 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800
          text-white font-medium shadow-md hover:scale-[1.03] transition"
        >
          {/* Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
            />
          </svg>
  
          Download
        </button>
  
        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-[#0a1628] text-white rounded-md shadow-xl border border-white/10 z-50">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-sm hover:bg-black hover:text-white transition"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }