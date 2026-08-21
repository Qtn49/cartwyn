"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useConsent } from "@/lib/useConsent";
import { trackEvent } from "@/lib/analytics";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content: "Bonjour ! Une question sur Cartwyn, les tarifs ou comment démarrer ?",
};

const GENERIC_ERROR =
  "Je n'arrive pas à répondre pour le moment. Écris-nous à contact@cartwyn.fr, on te répond rapidement.";

export default function ChatBubble() {
  const consent = useConsent();
  const chatAllowed = consent.chat;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [limited, setLimited] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [messages.length, loading, shouldReduceMotion]);

  // Le bouton flottant est en position fixe : au tout premier écran sur
  // mobile, il peut chevaucher la fin du sous-titre du hero. On ne le
  // masque qu'en dessous du breakpoint sm (via max-sm:), donc le desktop
  // n'est jamais concerné.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 120);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || limited) return;

    if (!hasStarted) {
      trackEvent("Chat utilisé");
      setHasStarted(true);
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json().catch(() => null);
      const reply: string =
        (data && typeof data.reply === "string" && data.reply) || GENERIC_ERROR;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (data?.limited) setLimited(true);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: GENERIC_ERROR }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[3px] border border-creme/15 bg-ink text-creme shadow-xl shadow-black/30"
        >
          <div className="border-b border-creme/15 px-4 py-3">
            <p className="label text-xs font-medium text-creme/65">Cartwyn</p>
          </div>

          {!chatAllowed ? (
            <div className="p-4">
              <p className="text-sm leading-relaxed">
                Active les cookies de chat dans les préférences pour discuter
                en direct, ou écris-nous directement.
              </p>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-3 inline-block text-sm font-medium text-bronze underline underline-offset-4 hover:text-creme transition-colors"
              >
                Aller au formulaire de contact
              </a>
            </div>
          ) : (
            <>
              <div
                ref={scrollRef}
                className="no-scrollbar flex max-h-80 flex-col gap-2.5 overflow-y-auto px-4 py-4"
              >
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[3px] px-3.5 py-2 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-bronze/25 text-creme"
                          : "border border-creme/15 bg-ink-soft text-creme"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div
                      className="rounded-[3px] border border-creme/15 bg-ink-soft px-3.5 py-2 text-sm text-creme/50"
                      aria-live="polite"
                      aria-label="En train de répondre"
                    >
                      …
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-creme/15 p-3">
                {limited ? (
                  <a
                    href="#contact"
                    onClick={() => setOpen(false)}
                    className="label block text-center text-[11px] font-medium text-bronze underline underline-offset-4 hover:text-creme transition-colors"
                  >
                    Aller au formulaire de contact
                  </a>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      maxLength={1000}
                      placeholder="Écris ta question…"
                      disabled={loading}
                      aria-label="Ton message"
                      className="min-w-0 flex-1 rounded-[3px] border border-creme/20 bg-transparent px-3 py-2 text-sm text-creme placeholder:text-creme/40 focus:border-bronze focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={loading || !input.trim()}
                      aria-label="Envoyer"
                      className="label shrink-0 rounded-[3px] border border-creme/25 px-3 py-2 text-xs font-medium text-creme transition-colors hover:border-bronze disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Envoyer
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Une question ?"
        className={`label flex min-h-12 items-center gap-2 rounded-full border border-creme/25 bg-ink px-5 py-3 text-xs font-medium text-creme shadow-lg shadow-black/30 transition-[opacity,transform,border-color] duration-300 hover:border-bronze motion-reduce:transition-[border-color] ${
          open || scrolled
            ? "opacity-100"
            : "max-sm:pointer-events-none max-sm:translate-y-3 max-sm:opacity-0"
        }`}
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
