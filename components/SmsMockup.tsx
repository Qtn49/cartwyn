"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { smsConversation, type Leaf } from "@/components/smsConversationData";
import { trackEvent } from "@/lib/analytics";

type SmsMockupProps = {
  className?: string;
};

type Turn = {
  from: "cartwyn" | "client";
  text: string;
  time: string;
};

const timestamps = ["10:42", "10:44", "10:44", "10:51", "10:52", "11:08"];

// Démo de relance interactive : le visiteur se place du point de vue du
// client final ("vous" = la personne relancée par SMS) et choisit, à
// chaque étape, comment répondre — 3 réponses possibles x 3 étapes = 27
// parcours, dont une majorité se termine en non-conversion mais toujours
// avec un frein d'achat qualifié. Voir smsConversationData.ts et CLAUDE.md.
export default function SmsMockup({ className = "" }: SmsMockupProps) {
  const shouldReduceMotion = useReducedMotion();
  const [path, setPath] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const branch1 = path[0]
    ? smsConversation.replies.find((r) => r.id === path[0])
    : undefined;
  const branch2 =
    branch1 && path[1]
      ? branch1.next.replies.find((r) => r.id === path[1])
      : undefined;
  const leaf: Leaf | undefined =
    branch2 && path[2]
      ? branch2.next.replies.find((r) => r.id === path[2])
      : undefined;

  const turns: Turn[] = [{ from: "cartwyn", text: smsConversation.cartwynText, time: timestamps[0] }];
  if (branch1) {
    turns.push({ from: "client", text: branch1.clientText, time: timestamps[1] });
    turns.push({ from: "cartwyn", text: branch1.next.cartwynText, time: timestamps[2] });
  }
  if (branch2) {
    turns.push({ from: "client", text: branch2.clientText, time: timestamps[3] });
    turns.push({ from: "cartwyn", text: branch2.next.cartwynText, time: timestamps[4] });
  }
  if (leaf) {
    turns.push({ from: "client", text: leaf.clientText, time: timestamps[5] });
  }

  const currentOptions = leaf
    ? null
    : branch2
      ? branch2.next.replies
      : branch1
        ? branch1.next.replies
        : smsConversation.replies;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: shouldReduceMotion ? "auto" : "smooth" });
  }, [turns.length, shouldReduceMotion]);

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
      className={`overflow-hidden rounded-[3px] border border-ink/10 bg-creme-soft shadow-[0_30px_70px_-35px_rgba(18,16,13,0.3)] ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bronze text-xs font-medium text-creme">
          C
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">Cartwyn</p>
          <p className="text-[11px] text-ink/65">Boutique en ligne</p>
        </div>
      </div>

      <div ref={scrollRef} className="no-scrollbar flex h-[360px] flex-col gap-3 overflow-y-auto px-5 py-5">
        <AnimatePresence initial={false}>
          {turns.map((turn, i) => (
            <motion.div
              key={i}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className={`flex ${turn.from === "client" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[85%]">
                <div
                  className={`rounded-[3px] px-4 py-2.5 text-sm leading-relaxed ${
                    turn.from === "client"
                      ? "bg-ink text-creme"
                      : "border border-ink/10 bg-creme text-ink"
                  }`}
                >
                  {turn.text}
                </div>
                <p
                  className={`mt-1 text-[10px] text-ink/65 ${
                    turn.from === "client" ? "text-right" : "text-left"
                  }`}
                >
                  {turn.time}
                  {turn.from === "client" && i === turns.length - 1 ? " · Envoyé" : ""}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {leaf && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
            className="mt-1 rounded-[3px] border border-bronze/40 bg-creme px-4 py-3"
          >
            <p className="label text-[10px] font-medium text-bronze">
              {leaf.outcome.type === "conversion" ? "Issue : conversion" : "Issue : non-conversion"}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink/70">
              {leaf.outcome.qualification}
            </p>
          </motion.div>
        )}
      </div>

      <div className="border-t border-ink/10 px-5 py-4">
        {currentOptions ? (
          <div className="flex flex-col gap-2">
            {currentOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  if (path.length === 0) trackEvent("Démo SMS utilisée");
                  setPath((p) => [...p, option.id]);
                }}
                className="label rounded-[3px] border border-ink/20 px-3 py-2 text-left text-[11px] font-medium normal-case tracking-normal text-ink/80 transition-colors duration-300 hover:border-bronze hover:bg-bronze/10"
              >
                {option.clientText}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setPath([])}
            className="label text-[11px] font-medium text-bronze underline underline-offset-4 transition-colors hover:text-ink"
          >
            Recommencer
          </button>
        )}
      </div>
    </motion.div>
  );
}
