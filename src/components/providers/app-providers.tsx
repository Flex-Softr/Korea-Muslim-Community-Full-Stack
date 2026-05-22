"use client";

import { Suspense } from "react";
import {
  LanguageProvider,
  type Lang,
} from "@/components/i18n/LanguageProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast-system";

export function AppProviders({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang: Lang;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider>
        <LanguageProvider initialLang={initialLang}>
          <Suspense fallback={null}>{children}</Suspense>
        </LanguageProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
