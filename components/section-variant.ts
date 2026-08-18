// Tokens partagés pour les nuances de section. Direction luxe : l'encre
// profonde est le fond dominant sur presque toute la page ; le crème n'est
// utilisé que comme respiration rare (1-2 sections max). Voir CLAUDE.md.

export type SectionTone = "ink" | "ink-soft" | "creme";

export const sectionTokens = {
  ink: {
    bg: "bg-ink",
    text: "text-creme",
    textSoft: "text-creme/65",
    border: "border-creme/15",
    divide: "divide-creme/15",
    line: "bg-creme/15",
    card: "bg-creme/5",
  },
  "ink-soft": {
    bg: "bg-ink-soft",
    text: "text-creme",
    textSoft: "text-creme/65",
    border: "border-creme/15",
    divide: "divide-creme/15",
    line: "bg-creme/15",
    card: "bg-creme/5",
  },
  creme: {
    bg: "bg-creme",
    text: "text-ink",
    textSoft: "text-ink/65",
    border: "border-ink/10",
    divide: "divide-ink/10",
    line: "bg-ink/10",
    card: "bg-creme-soft",
  },
} as const satisfies Record<SectionTone, Record<string, string>>;
