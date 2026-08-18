"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ConsentCategories, writeConsent } from "@/lib/consent";
import { useConsent } from "@/lib/useConsent";

export default function CookieConsent() {
  const consent = useConsent();
  const visible = !consent.decided;
  const [showDetails, setShowDetails] = useState(false);
  const [categories, setCategories] = useState<ConsentCategories>({
    analytics: false,
    chat: false,
  });
  const shouldReduceMotion = useReducedMotion();

  function acceptAll() {
    writeConsent({ analytics: true, chat: true });
  }

  function refuseAll() {
    writeConsent({ analytics: false, chat: false });
  }

  function saveCustom() {
    writeConsent(categories);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Gestion des cookies"
          aria-modal="false"
          initial={shouldReduceMotion ? { opacity: 1 } : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
        >
          <div className="mx-auto max-w-3xl rounded-2xl border border-brun/10 bg-creme shadow-xl shadow-brun/10 p-5 sm:p-6">
            <p className="text-sm sm:text-base leading-relaxed">
              Nous utilisons des cookies essentiels au fonctionnement du site.
              Avec votre accord, nous utilisons aussi des cookies de mesure
              d&apos;audience et de chat pour améliorer votre expérience.
              Vous pouvez accepter, refuser ou personnaliser ce choix à tout
              moment.
            </p>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3 border-t border-brun/10 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">Essentiels</p>
                        <p className="text-xs text-brun-soft">
                          Nécessaires au fonctionnement du site, toujours actifs.
                        </p>
                      </div>
                      <span className="text-xs uppercase tracking-wide text-brun-soft">
                        Toujours actif
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">Mesure d&apos;audience</p>
                        <p className="text-xs text-brun-soft">
                          Statistiques anonymes de fréquentation.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={categories.analytics}
                        onChange={(e) =>
                          setCategories((c) => ({ ...c, analytics: e.target.checked }))
                        }
                        className="h-5 w-5 accent-terracotta"
                        aria-label="Autoriser les cookies de mesure d'audience"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-sm">Chat</p>
                        <p className="text-xs text-brun-soft">
                          Permet d&apos;afficher le widget de messagerie.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={categories.chat}
                        onChange={(e) =>
                          setCategories((c) => ({ ...c, chat: e.target.checked }))
                        }
                        className="h-5 w-5 accent-terracotta"
                        aria-label="Autoriser les cookies de chat"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={acceptAll}
                className="rounded-full bg-terracotta px-5 py-2.5 text-sm font-medium text-creme hover:bg-terracotta-dark transition-colors"
              >
                Tout accepter
              </button>
              <button
                onClick={refuseAll}
                className="rounded-full border border-brun/20 px-5 py-2.5 text-sm font-medium hover:bg-brun/5 transition-colors"
              >
                Tout refuser
              </button>
              {showDetails ? (
                <button
                  onClick={saveCustom}
                  className="rounded-full border border-brun/20 px-5 py-2.5 text-sm font-medium hover:bg-brun/5 transition-colors"
                >
                  Enregistrer mes choix
                </button>
              ) : (
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-sm font-medium underline underline-offset-4 hover:text-terracotta transition-colors"
                >
                  Personnaliser
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
