import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const solaimanLipi = localFont({
  src: [
    {
      path: "../../public/fonts/SolaimanLipi.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-solaiman-lipi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Korea Muslim Community",
  description:
    "Community site for Muslims in Korea — events, resources, and member access.",
  icons: {
    icon: [{ url: "/fav.jpg", type: "image/jpeg" }],
    apple: [{ url: "/fav.jpg", type: "image/jpeg" }],
  },
  // Discourage Chrome / Google Translate from showing the translate bar on this site.
  other: {
    google: "notranslate",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLang = "bn";

  return (
    <html
      lang={initialLang}
      dir="ltr"
      translate="no"
      suppressHydrationWarning
      className={`${solaimanLipi.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-bangla" translate="no">
        <AppProviders initialLang={initialLang}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}

// import type { Metadata } from "next";
// import { Noto_Sans_Bengali } from "next/font/google";
// import { auth } from "@/auth";
// import { AppProviders } from "@/components/providers/app-providers";
// import "./globals.css";

// const notoSansBengali = Noto_Sans_Bengali({
//   subsets: ["bengali"],
//   weight: ["400", "500", "600", "700"],
//   variable: "--font-noto-sans-bengali",
//   display: "swap",
// });

// export const metadata: Metadata = {
//   title: "Korea Muslim Community",
//   description: "Community site for Muslims in Korea — events, resources, and member access.",
//   icons: {
//     icon: [
//       { url: '/logo.png', sizes: '512x512' },
//     ],
//     shortcut: ['/logo.png'],
//     apple: [{ url: '/logo.png', sizes: '180x180', type: 'image/png' }],
//   },
// };

// export default async function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   const session = await auth();

//   return (
//     <html
//       lang="bn"
//       dir="ltr"
//       suppressHydrationWarning
//       className={`${notoSansBengali.variable} h-full antialiased`}
//     >
//       <body className="min-h-full bg-background text-foreground">
//         <AppProviders session={session}>{children}</AppProviders>
//       </body>
//     </html>
//   );
// }
