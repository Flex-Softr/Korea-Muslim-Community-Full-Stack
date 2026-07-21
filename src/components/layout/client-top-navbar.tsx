"use client";

import { ChevronDown, Phone, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { Session } from "next-auth";
import { useTranslation } from "react-i18next";
import { useMounted } from "@/hooks/use-mounted";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { ModeToggle } from "./mode-toggle";

import type { Lang } from "@/components/providers/language-provider";
import { useLanguage } from "@/components/providers/language-provider";

import { useToastSystem } from "../ui/toast-system";
import { ClientUserMenu } from "./client-user-menu";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const LANG_OPTIONS: Array<{
  value: Lang;
  label: string;
  flagSrc: string;
}> = [
  { value: "en", label: "English", flagSrc: "/flags/us.svg" },
  { value: "bn", label: "বাংলা", flagSrc: "/flags/bd.svg" },
  { value: "ko", label: "한국어", flagSrc: "/flags/kr.svg" },
];

const LANGUAGE_FLAG_SRC: Record<Lang, string> = {
  en: "/flags/us.svg",
  bn: "/flags/bd.svg",
  ko: "/flags/kr.svg",
};

export function TopHeaderBar({
  user,
}: {
  user: Session["user"] | null;
}) {
  const { lang, setLang, t } = useLanguage();
  const { i18n } = useTranslation();

  const [langOpen, setLangOpen] = useState(false);
  const mounted = useMounted();

  const { notify } = useToastSystem();

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const triggerFlagSrc = LANGUAGE_FLAG_SRC[lang] ?? LANGUAGE_FLAG_SRC.en;

  return (
    <div className="w-full bg-[#1e5f8f] text-xs text-white">
      <div className="mx-auto flex max-w-full items-center justify-end px-4 py-1.5 md:max-w-[95%] md:justify-between md:py-3">
        <div className="hidden items-center gap-6 text-sm md:flex">
          <span className="flex gap-1.5">
            <Mail className="size-4" />
            <a href="mailto:info@kmc.com">info@kmc.com</a>
          </span>

          <span className="flex gap-1.5">
            <Phone className="size-4" />
            <a href="tel:+821012345678">+82 10-1234-5678</a>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu open={langOpen} onOpenChange={setLangOpen}>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1.5 rounded-sm px-2 py-1.5 shadow-sm shadow-zinc-800/60 hover:bg-zinc-800 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800">
              <Image
                src={triggerFlagSrc}
                alt={lang}
                width={20}
                height={14}
                className="h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
              />

              <span className="text-xs font-semibold">
                {lang.toUpperCase()}
              </span>

              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {LANG_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className="flex cursor-pointer items-center"
                  onClick={() => {
                    void (async () => {
                      await setLang(option.value);

                      setLangOpen(false);

                      notify(
                        i18n
                          .getFixedT(option.value)(
                            "common.languageChanged",
                          ),
                        "success",
                      );
                    })();
                  }}
                >
                  <Image
                    src={option.flagSrc}
                    alt={option.label}
                    width={20}
                    height={14}
                    className="mr-2 h-3.5 w-5 shrink-0 rounded-[2px] object-cover"
                  />

                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          {user ? (
            <ClientUserMenu
              email={user.email ?? ""}
              name={user.name}
              image={user.image}
            />
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "rounded-sm bg-[#0a1628] p-3 text-sm font-semibold text-white shadow-sm shadow-zinc-800/60 hover:bg-zinc-200 focus-visible:ring-[#2c7bb6]/5 focus-visible:ring-offset-background dark:text-white dark:hover:bg-zinc-800",
              )}
            >
              {t("common.login")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}













// "use client";

// import { ChevronDown, Phone, Mail } from "lucide-react";
// import Link from "next/link";
// import { useState } from "react";
// import type { Session } from "next-auth";
// import { useTranslation } from "react-i18next";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu";
// import { ModeToggle } from "./mode-toggle";
// import type { Lang } from "@/components/providers/language-provider";
// import { useLanguage } from "@/components/providers/language-provider";
// import { useToastSystem } from "../ui/toast-system";
// import { ClientUserMenu } from "./client-user-menu";
// import { cn } from "@/lib/utils";
// import { buttonVariants } from "@/components/ui/button";

// const LANG_OPTIONS: Array<{
//   value: Lang;
//   labelKey: "common.bengali" | "common.english" | "common.korean";
//   flag: string;
// }> = [
//   { value: "en", labelKey: "common.english", flag: "🇺🇸" },
//   { value: "bn", labelKey: "common.bengali", flag: "🇧🇩" },
//   { value: "ko", labelKey: "common.korean", flag: "🇰🇷" },
// ];

// const LANGUAGE_FLAG: Record<Lang, string> = {
//   en: "🇺🇸",
//   bn: "🇧🇩",
//   ko: "🇰🇷",
// };

// export function TopHeaderBar({ user }: { user: Session["user"] | null }) {
//   const { lang, setLang, t } = useLanguage();
//   const { i18n } = useTranslation();
//   const [langOpen, setLangOpen] = useState(false);
//   const { notify } = useToastSystem();

//   const triggerFlag = LANGUAGE_FLAG[lang] ?? LANGUAGE_FLAG.en;

//   return (
//     <div className="w-full bg-[#1e5f8f] text-xs text-white">
//       <div className="mx-auto flex max-w-full items-center justify-end px-4 py-1.5 md:max-w-[95%] md:justify-between md:py-3">
//         <div className="hidden items-center gap-6 text-sm md:flex">
//           <span className="flex gap-1.5">
//             <Mail className="size-4" />{" "}
//             <a href="mailto:info@kmc.com">info@kmc.com</a>
//           </span>
//           <span className="flex gap-1.5">
//             <Phone className="size-4" />{" "}
//             <a href="tel:+821012345678">+82 10-1234-5678</a>
//           </span>
//         </div>

//         <div className="flex items-center gap-3">
//           <DropdownMenu open={langOpen} onOpenChange={setLangOpen}>
//             <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1.5 shadow-sm shadow-zinc-800/60 hover:bg-zinc-200 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800">
//               <span aria-hidden className="text-base leading-none">
//                 {triggerFlag}
//               </span>
//               <span className="text-xs font-semibold">{lang.toUpperCase()}</span>
//               <ChevronDown className="size-4" />
//             </DropdownMenuTrigger>

//             <DropdownMenuContent align="end">
//               {LANG_OPTIONS.map((option) => (
//                 <DropdownMenuItem
//                   key={option.value}
//                   className="cursor-pointer"
//                   onClick={() => {
//                     void (async () => {
//                       await setLang(option.value);
//                       setLangOpen(false);
//                       notify(
//                         i18n.getFixedT(option.value)("common.languageChanged"),
//                         "success",
//                       );
//                     })();
//                   }}
//                 >
//                   <span className="mr-2 text-base leading-none" aria-hidden>
//                     {option.flag}
//                   </span>
//                   {t(option.labelKey)}
//                 </DropdownMenuItem>
//               ))}
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <ModeToggle />

//           {user ? (
//             <ClientUserMenu
//               email={user.email ?? ""}
//               name={user.name}
//               image={user.image}
//             />
//           ) : (
//             <Link
//               href="/login"
//               className={cn(
//                 buttonVariants({ variant: "ghost", size: "sm" }),
//                 "rounded-sm bg-[#0a1628] p-3 text-sm font-semibold text-white shadow-sm shadow-zinc-800/60 hover:bg-zinc-200 focus-visible:ring-[#2c7bb6]/5 focus-visible:ring-offset-background dark:text-white dark:hover:bg-zinc-800",
//               )}
//             >
//               {t("common.login")}
//             </Link>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
