import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { PwaRegister } from "@/components/pwa-register";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ZONA — Nightclub",
    template: "%s | ZONA",
  },
  description:
    "A destination for unforgettable nights and private celebrations.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "ZONA — Nightclub",
    description:
      "A destination for unforgettable nights and private celebrations.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "ZONA Admin",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <PwaRegister />
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
