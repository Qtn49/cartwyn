// Tokens partagés pour l'alternance de fond clair/sombre entre sections.
// Voir CLAUDE.md — palette : crème #F3ECE1, brun encre #2B2117, terracotta #B85C38.

export type SectionVariant = "light" | "dark";

export const sectionTokens = {
  light: {
    bg: "bg-creme",
    text: "text-brun",
    textSoft: "text-brun-soft",
    border: "border-brun/10",
    card: "bg-creme-soft",
  },
  dark: {
    bg: "bg-brun",
    text: "text-creme",
    textSoft: "text-creme/70",
    border: "border-creme/15",
    card: "bg-creme/5",
  },
} as const satisfies Record<SectionVariant, Record<string, string>>;
