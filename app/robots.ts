import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Autorisation explicite des crawlers IA (ChatGPT, Claude, Perplexity,
// Google AI Overviews, Apple Intelligence) — sans ça le site n'est pas
// éligible à être cité par ces moteurs (voir CLAUDE.md, section GEO).
const aiCrawlers = [
  "GPTBot",
  "ClaudeBot",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      ...aiCrawlers.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
