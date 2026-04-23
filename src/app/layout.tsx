import type { Metadata } from "next";
import { auth } from "@/auth";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Korea Muslim Community",
  description: "Community site for Muslims in Korea — events, resources, and member access.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="bn" dir="ltr" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AppProviders session={session}>{children}</AppProviders>
      </body>
    </html>
  );
}
