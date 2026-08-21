"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import CtaButton from "@/components/CtaButton";
import { trackEvent } from "@/lib/analytics";

const navLinks = [
  { href: "#comment-ca-marche", label: "Comment ça marche" },
  { href: "#simulateur", label: "Simulateur" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 text-ink transition-all duration-300 ${
        scrolled
          ? "border-b border-ink/10 bg-creme/95 shadow-sm shadow-black/5 backdrop-blur-md"
          : "border-b border-transparent bg-creme/40 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="font-display text-xl sm:text-2xl font-semibold tracking-tight">
          Cartwyn
        </Link>

        <nav className="label hidden lg:flex items-center gap-8 text-xs font-medium">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="group relative py-1">
              {link.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-bronze transition-transform duration-300 ease-out group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 lg:gap-4">
          <CtaButton
            href="#contact"
            onClick={() => trackEvent("CTA cliqué", { emplacement: "header" })}
            className="whitespace-nowrap px-3 py-2 text-[10px] sm:px-4 sm:py-2.5 sm:text-[11px] lg:px-6 lg:py-3 lg:text-xs"
          >
            <span className="lg:hidden">Audit gratuit</span>
            <span className="hidden lg:inline">Recevoir mon audit gratuit</span>
          </CtaButton>

          <button
            className="lg:hidden flex h-12 w-12 flex-col items-center justify-center gap-1.5"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span
              className={`block h-0.5 w-6 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <motion.nav
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="lg:hidden overflow-hidden border-t border-ink/10 bg-creme"
        >
          <div className="flex flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="label rounded-[3px] px-2 py-3 text-sm font-medium hover:bg-ink/5"
              >
                {link.label}
              </a>
            ))}
            <CtaButton
              href="#contact"
              onClick={() => {
                setOpen(false);
                trackEvent("CTA cliqué", { emplacement: "header" });
              }}
              className="mt-2 w-full"
            >
              Recevoir mon audit gratuit
            </CtaButton>
          </div>
        </motion.nav>
      )}
    </header>
  );
}
