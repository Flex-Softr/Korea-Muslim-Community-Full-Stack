"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import {
  LanguageProvider,
  type Lang,
} from "@/components/i18n/LanguageProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast-system";

export function AppProviders({
  children,
  session,
  initialLang,
}: {
  children: React.ReactNode;
  session: Session | null;
  initialLang: Lang;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider session={session} refetchOnWindowFocus={false} refetchWhenOffline={false}>
        <ToastProvider>
          <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
