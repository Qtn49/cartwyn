import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import ChatBubble from "@/components/ChatBubble";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const siteUrl = "https://www.cartwyn.fr";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cartwyn — Récupérez le CA de vos paniers abandonnés",
    template: "%s — Cartwyn",
  },
  description:
    "Cartwyn installe et gère pour votre boutique Shopify ou PrestaShop un système de relance automatique des paniers abandonnés, avec qualification du frein d'achat et reporting mensuel du CA réellement récupéré.",
  openGraph: {
    title: "Cartwyn — Récupérez le CA de vos paniers abandonnés",
    description:
      "Relance automatique des paniers abandonnés, qualification des freins d'achat et reporting mensuel du CA récupéré, pour e-commerçants français.",
    url: siteUrl,
    siteName: "Cartwyn",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cartwyn — Récupérez le CA de vos paniers abandonnés",
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
      <body className="min-h-full flex flex-col bg-ink text-creme font-body">
        {children}
        <CookieConsent />
        <ChatBubble />
      </body>
    </html>
  );
}
