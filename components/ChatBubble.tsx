"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useConsent } from "@/lib/useConsent";

// Intégration Crisp : remplacer CRISP_WEBSITE_ID par la clé du compte Cartwyn,
// puis décommenter le chargement du script dans useEffect ci-dessous.
// const CRISP_WEBSITE_ID = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX";

export default function ChatBubble() {
  const consent = useConsent();
  const chatAllowed = consent.chat;
  const [open, setOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!chatAllowed) return;
    // window.$crisp = [];
    // window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;
    // const script = document.createElement("script");
    // script.src = "https://client.crisp.chat/l.js";
    // script.async = true;
    // document.head.appendChild(script);
  }, [chatAllowed]);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-72 rounded-[3px] border border-creme/15 bg-ink text-creme p-4 shadow-xl shadow-black/30"
        >
          <p className="text-sm leading-relaxed">
            {chatAllowed
              ? "Le chat sera bientôt disponible ici. En attendant, écrivez-nous directement."
              : "Activez les cookies de chat dans les préférences pour discuter en direct, ou écrivez-nous directement."}
          </p>
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-3 inline-block text-sm font-medium text-bronze underline underline-offset-4 hover:text-creme transition-colors"
          >
            Aller au formulaire de contact
          </a>
        </motion.div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Une question ?"
        className="label flex items-center gap-2 rounded-full border border-creme/25 bg-ink px-5 py-3 text-xs font-medium text-creme shadow-lg shadow-black/30 transition-colors hover:border-bronze"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
        Une question ?
      </button>
    </div>
  );
}
