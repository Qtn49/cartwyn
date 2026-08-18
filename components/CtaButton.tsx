"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  className?: string;
};

type CtaLinkProps = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type CtaButtonOnlyProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type CtaButtonProps = CtaLinkProps | CtaButtonOnlyProps;

const base =
  "label group relative inline-flex items-center justify-center overflow-hidden rounded-[3px] border border-creme/40 px-6 py-3 text-xs font-medium text-creme transition-colors duration-300 hover:border-bronze disabled:cursor-not-allowed disabled:opacity-50";

// Bouton bordure fine avec remplissage bronze discret et progressif au
// survol — jamais de pilule pleine colorée, cf. CLAUDE.md direction luxe.
export default function CtaButton(props: CtaButtonProps) {
  const { children, className = "", ...rest } = props;

  if (props.href !== undefined) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={`${base} ${className}`} {...anchorRest}>
        <span aria-hidden="true" className="absolute inset-0 origin-left scale-x-0 bg-bronze/25 transition-transform duration-500 ease-out group-hover:scale-x-100" />
        <span className="relative">{children}</span>
      </a>
    );
  }

  return (
    <button className={`${base} ${className}`} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      <span aria-hidden="true" className="absolute inset-0 origin-left scale-x-0 bg-bronze/25 transition-transform duration-500 ease-out group-hover:scale-x-100" />
      <span className="relative">{children}</span>
    </button>
  );
}
