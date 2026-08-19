"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import type { SectionTone } from "@/components/section-variant";

type BaseProps = {
  children: ReactNode;
  className?: string;
  tone?: SectionTone;
};

type CtaLinkProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type CtaButtonOnlyProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type CtaButtonProps = CtaLinkProps | CtaButtonOnlyProps;

const base =
  "label group relative inline-flex items-center justify-center overflow-hidden rounded-[3px] border px-6 py-3 text-xs font-medium transition-colors duration-300 hover:border-bronze disabled:cursor-not-allowed disabled:opacity-50";

const toneClasses: Record<SectionTone, string> = {
  creme: "border-ink/30 text-ink",
  "creme-soft": "border-ink/30 text-ink",
  ink: "border-creme/40 text-creme",
};

// Bouton bordure fine avec remplissage bronze discret et progressif au
// survol — jamais de pilule pleine colorée, cf. CLAUDE.md direction luxe.
export default function CtaButton(props: CtaButtonProps) {
  const { children, className = "", tone = "creme", ...rest } = props;
  const classes = `${base} ${toneClasses[tone]} ${className}`;

  if (props.href !== undefined) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={classes} {...anchorRest}>
        <span aria-hidden="true" className="absolute inset-0 origin-left scale-x-0 bg-bronze/25 transition-transform duration-500 ease-out group-hover:scale-x-100" />
        <span className="relative">{children}</span>
      </a>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      <span aria-hidden="true" className="absolute inset-0 origin-left scale-x-0 bg-bronze/25 transition-transform duration-500 ease-out group-hover:scale-x-100" />
      <span className="relative">{children}</span>
    </button>
  );
}
