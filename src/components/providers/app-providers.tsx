"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { GlobalAutoTranslator } from "@/components/providers/global-auto-translator";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast-system";

export function AppProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
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
          <LanguageProvider>
            <GlobalAutoTranslator />
            {children}
          </LanguageProvider>
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
