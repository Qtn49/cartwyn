// Tokens partagés pour les nuances de section. Direction luxe : le crème est
// le fond dominant sur presque toute la page ; l'encre profonde n'est
// utilisée que comme respiration rare (1-2 sections max). Voir CLAUDE.md.

export type SectionTone = "creme" | "creme-soft" | "ink";

export const sectionTokens = {
  creme: {
    bg: "bg-creme",
    text: "text-ink",
    textSoft: "text-ink/65",
    border: "border-ink/10",
    divide: "divide-ink/10",
    line: "bg-ink/10",
    card: "bg-creme-soft",
  },
  "creme-soft": {
    bg: "bg-creme-soft",
    text: "text-ink",
    textSoft: "text-ink/65",
    border: "border-ink/10",
    divide: "divide-ink/10",
    line: "bg-ink/10",
    card: "bg-creme",
  },
  ink: {
    bg: "bg-ink",
    text: "text-creme",
    textSoft: "text-creme/65",
    border: "border-creme/15",
    divide: "divide-creme/15",
    line: "bg-creme/15",
    card: "bg-creme/5",
  },
} as const satisfies Record<SectionTone, Record<string, string>>;
