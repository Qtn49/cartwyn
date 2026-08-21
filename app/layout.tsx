import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import ChatBubble from "@/components/ChatBubble";
import AnalyticsScript from "@/components/AnalyticsScript";
import { siteUrl } from "@/lib/site";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

// Revalidation ISR : sans ce réglage, Next.js met les pages statiques en
// cache CDN/proxy pendant 1 an par défaut (s-maxage=31536000), ce qui est
// trop long pour un site encore en itération active — 1h donne un
// compromis correct entre fraîcheur et bénéfice du cache.
export const revalidate = 3600;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cartwyn — Relance des paniers abandonnés pour e-commerçants",
    template: "%s — Cartwyn",
  },
  description:
    "Cartwyn relance automatiquement vos paniers abandonnés (Shopify, PrestaShop) et vous reporte chaque mois le CA réellement récupéré.",
  openGraph: {
    title: "Cartwyn — Relance des paniers abandonnés pour e-commerçants",
    description:
      "Relance automatique des paniers abandonnés et qualification des freins d'achat, pour augmenter votre taux de conversion — reporting mensuel du CA récupéré.",
    url: siteUrl,
    siteName: "Cartwyn",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cartwyn — Relance des paniers abandonnés pour e-commerçants",
    description:
      "Relance automatique des paniers abandonnés, qualification des freins d'achat et reporting mensuel du CA récupéré.",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-creme text-ink font-body">
        {children}
        <CookieConsent />
        <ChatBubble />
        <AnalyticsScript />
      </body>
    </html>
  );
}
