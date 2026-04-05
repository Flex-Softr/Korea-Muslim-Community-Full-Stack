import type { Metadata } from "next";
import Script from "next/script";
import { AppProviders } from "@/components/providers/app-providers";
import { THEME_INIT_SCRIPT } from "@/components/providers/theme-init-inline";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korea Muslim Community",
  description: "Community site for Muslims in Korea — events, resources, and member access.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <Script id="kmc-theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
