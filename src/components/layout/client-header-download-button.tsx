"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FC } from "react";
import {
  flyoutPanel,
  flyoutRowClass,
  flyoutStartHidden,
  revealDirectUl,
} from "@/components/layout/nav-flyout-classes";
import { headerNavTextSizeClass } from "@/components/layout/header-nav-typography";
import { useLanguage } from "@/components/providers/language-provider";
import type { Lang } from "@/lib/i18n/lang";
import { cn } from "@/lib/utils";

const DOWNLOAD_ITEMS = [
  { labelKey: "download.itemPdf", href: "/download/pdf" },
  { labelKey: "download.itemEbookLeaflet", href: "/download/ebook-leaflet" },
  { labelKey: "download.itemBook", href: "/download/book" },
  { labelKey: "download.itemForm", href: "/download/form" },
  { labelKey: "download.itemPoster", href: "/download/poster" },
  { labelKey: "download.itemSyllabus", href: "/download/syllabus" },
] as const;

function downloadButtonClassName(lang: Lang) {
  return cn(
    "flex items-center gap-2 rounded-sm bg-[#0a1628] px-5 py-2 font-medium text-white shadow-md shadow-zinc-800/60 transition hover:scale-[1.03] hover:bg-zinc-800 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background lg:px-6 lg:py-2.5 dark:text-zinc-300 dark:hover:bg-zinc-800",
    headerNavTextSizeClass(lang),
  );
}

function isDownloadActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function downloadMenuLabel(
  t: ReturnType<typeof useLanguage>["t"],
  key: string,
): string {
  return (t as (k: string) => string)(key);
}

export type DownloadMenuProps = {
  variant?: "header" | "drawer";
};

export const DownloadMenu: FC<DownloadMenuProps> = ({
  variant = "header",
}) => {
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? ""; // ✅ FIX HERE

  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t, lang } = useLanguage();

  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
      />
    </svg>
  );

  const links = DOWNLOAD_ITEMS.map((item) => {
    const active = isDownloadActive(pathname, item.href);
    const label = downloadMenuLabel(t, item.labelKey);

    return (
      <li key={item.href} role="presentation">
        <Link
          href={item.href}
          role="menuitem"
          className={cn(
            flyoutRowClass(lang),
            active &&
              "underline decoration-white underline-offset-[3px] hover:bg-[#235d94]",
          )}
          onClick={() => variant === "drawer" && setDrawerOpen(false)}
        >
          {label}
        </Link>
      </li>
    );
  });

  if (variant === "drawer") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          className={cn(downloadButtonClassName(lang), "w-full justify-center")}
          aria-expanded={drawerOpen}
          aria-haspopup="menu"
        >
          {icon}
          {t("download.menu")}
        </button>

        {drawerOpen && (
          <ul
            role="menu"
            className={cn(
              flyoutPanel,
              "relative z-10 mt-2 w-full min-w-0 pb-5 pt-2",
            )}
          >
            {links}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative inline-flex", revealDirectUl)}>
      <button
        type="button"
        className={downloadButtonClassName(lang)}
        aria-haspopup="menu"
      >
        {icon}
        {t("download.menu")}
      </button>

      <ul
        role="menu"
        className={cn(
          flyoutPanel,
          "absolute left-0 top-full z-[60]",
          flyoutStartHidden,
        )}
      >
        {links}
      </ul>
    </div>
  );
};


// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState, type FC } from "react";
// import {
//   flyoutPanel,
//   flyoutRowClass,
//   flyoutStartHidden,
//   revealDirectUl,
// } from "@/components/layout/nav-flyout-classes";
// import { headerNavTextSizeClass } from "@/components/layout/header-nav-typography";
// import { useLanguage } from "@/components/providers/language-provider";
// import type { Lang } from "@/lib/i18n/lang";
// import { cn } from "@/lib/utils";

// const DOWNLOAD_ITEMS = [
//   { labelKey: "download.itemPdf", href: "/download/pdf" },
//   { labelKey: "download.itemEbookLeaflet", href: "/download/ebook-leaflet" },
//   { labelKey: "download.itemBook", href: "/download/book" },
//   { labelKey: "download.itemForm", href: "/download/form" },
//   { labelKey: "download.itemPoster", href: "/download/poster" },
//   { labelKey: "download.itemSyllabus", href: "/download/syllabus" },
// ] as const;

// function downloadButtonClassName(lang: Lang) {
//   return cn(
//     "flex items-center gap-2 rounded-sm bg-[#0a1628] px-5 py-2 font-medium text-white shadow-md shadow-zinc-800/60 transition hover:scale-[1.03] hover:bg-zinc-800 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background lg:px-6 lg:py-2.5 dark:text-zinc-300 dark:hover:bg-zinc-800",
//     headerNavTextSizeClass(lang),
//   );
// }

// function isDownloadActive(pathname: string, href: string) {
//   return pathname === href || pathname.startsWith(`${href}/`);
// }

// /** Narrow `t` for `.map()` label keys (react-i18next dynamic-key JSX typing). */
// function downloadMenuLabel(
//   t: ReturnType<typeof useLanguage>["t"],
//   key: string,
// ): string {
//   return (t as (k: string) => string)(key);
// }

// export type DownloadMenuProps = {
//   variant?: "header" | "drawer";
// };

// export const DownloadMenu: FC<DownloadMenuProps> = ({
//   variant = "header",
// }) => {
//   const pathname = usePathname();
//   const [drawerOpen, setDrawerOpen] = useState(false);
//   const { t, lang } = useLanguage();

//   const icon = (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       className="h-5 w-5 shrink-0"
//       fill="none"
//       viewBox="0 0 24 24"
//       stroke="currentColor"
//       aria-hidden
//     >
//       <path
//         strokeWidth={2}
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
//       />
//     </svg>
//   );

//   const links = DOWNLOAD_ITEMS.map((item) => {
//     const active = isDownloadActive(pathname, item.href);
//     const label = downloadMenuLabel(t, item.labelKey);
//     return (
//       <li key={item.href} role="presentation">
//         <Link
//           href={item.href}
//           role="menuitem"
//           className={cn(
//             flyoutRowClass(lang),
//             active &&
//               "underline decoration-white underline-offset-[3px] hover:bg-[#235d94]",
//           )}
//           onClick={() => variant === "drawer" && setDrawerOpen(false)}
//         >
//           {label}
//         </Link>
//       </li>
//     );
//   });

//   if (variant === "drawer") {
//     return (
//       <div className="relative">
//         <button
//           type="button"
//           onClick={() => setDrawerOpen(!drawerOpen)}
//           className={cn(downloadButtonClassName(lang), "w-full justify-center")}
//           aria-expanded={drawerOpen}
//           aria-haspopup="menu"
//         >
//           {icon}
//           {t("download.menu")}
//         </button>
//         {drawerOpen && (
//           <ul
//             role="menu"
//             className={cn(
//               flyoutPanel,
//               "relative z-10 mt-2 w-full min-w-0 pb-5 pt-2",
//             )}
//           >
//             {links}
//           </ul>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className={cn("relative inline-flex", revealDirectUl)}>
//       <button
//         type="button"
//         className={downloadButtonClassName(lang)}
//         aria-haspopup="menu"
//       >
//         {icon}
//         {t("download.menu")}
//       </button>
//       <ul
//         role="menu"
//         className={cn(flyoutPanel, "absolute left-0 top-full z-[60]", flyoutStartHidden)}
//       >
//         {links}
//       </ul>
//     </div>
//   );
// };
