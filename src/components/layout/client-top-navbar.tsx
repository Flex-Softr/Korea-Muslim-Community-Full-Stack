"use client"
import { ChevronDown, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import { Lang, useLanguage } from "../i18n/LanguageProvider";
import { useToastSystem } from "../ui/toast-system";
import { useState } from "react";
import { ClientUserMenu } from "./client-user-menu";
import type { Session } from "next-auth";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";


const LANG_OPTIONS: Array<{ value: Lang; labelKey: "common.bengali" | "common.english" | "common.korean" }> = [
    { value: "bn", labelKey: "common.bengali" },
    { value: "en", labelKey: "common.english" },
    { value: "kr", labelKey: "common.korean" }, // FIXED
  ];

export function TopHeaderBar({ user }: { user: Session["user"] | null }) {
    const { lang, setLang, t } = useLanguage();
    const [langOpen, setLangOpen] = useState(false);
    const { notify } = useToastSystem();
  
    const getLangLabel = (lang: Lang) => {
        const match = LANG_OPTIONS.find((l) => l.value === lang);
        return match ? match.value.toUpperCase() : "EN";
      };
      
    return (
      <div className="w-full bg-[#1e5f8f] text-white text-xs">
        <div className="mx-auto flex md:max-w-[95%] max-w-full items-center justify-end md:justify-between px-4 md:py-3 py-1.5">
          
          {/* LEFT: Email & Phone */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <span className="flex gap-1.5"><Mail className="size-4" /> <a href="mailto:info@kmc.com">info@kmc.com</a></span>
            <span className="flex gap-1.5"><Phone className="size-4" /> <a href="tel:+821012345678">+82 10-1234-5678</a></span>
          </div>
  
          {/* RIGHT: Language + Theme */}
          <div className="flex items-center gap-3">
            <DropdownMenu open={langOpen} onOpenChange={setLangOpen}>
              <DropdownMenuTrigger className="py-1.5 px-2 rounded-sm flex items-center gap-1 cursor-pointer shadow-sm shadow-zinc-800/60 hover:bg-zinc-200 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800">
                <span className="text-xs">Lang: <b className="text-xs pl-1" >  {getLangLabel(lang)}</b></span>
                <ChevronDown className="size-4" />
              </DropdownMenuTrigger>
  
              <DropdownMenuContent align="end">
                {LANG_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    className="cursor-pointer"
                    onClick={() => {
                      setLang(option.value);
                      setLangOpen(false);
                      notify(t("common.languageChanged"), "success");
                    }}
                  >
                    {t(option.labelKey)}
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
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "p-3 text-sm font-semibold bg-[#0a1628] rounded-sm shadow-sm shadow-zinc-800/60 hover:bg-zinc-200 focus-visible:ring-[#2c7bb6]/5 text-white0 focus-visible:ring-offset-background dark:text-white dark:hover:bg-zinc-800")}
          >
            Login
          </Link>
        )}
          
          </div>
        </div>
      </div>
    );
  }
