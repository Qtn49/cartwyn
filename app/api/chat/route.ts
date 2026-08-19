import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/chatSystemPrompt";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 300;
const HISTORY_WINDOW = 12; // 6 derniers échanges (user + assistant)
const MAX_USER_TURNS = 8;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES = 60;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const FALLBACK_MESSAGE =
  "Je n'arrive pas à répondre pour le moment. Écris-nous directement à contact@cartwyn.fr, on te répond rapidement.";
const RATE_LIMIT_MESSAGE =
  "Tu as atteint la limite de messages pour cette heure. Écris-nous à contact@cartwyn.fr, on te répond rapidement.";
const TURN_LIMIT_MESSAGE =
  "Pour aller plus loin, le mieux est de passer par le formulaire de contact du site ou par email à contact@cartwyn.fr — on te répond avec un vrai rappel.";

type ChatMessage = { role: "user" | "assistant"; content: string };

// Rate-limiting mémoire par IP — suffisant pour un seul conteneur Docker
// sans scaling horizontal (voir prompt de correction #9). Repart à vide à
// chaque redémarrage du conteneur, ce qui est acceptable à cette échelle.
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function isValidMessages(value: unknown): value is ChatMessage[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_MESSAGES) {
    return false;
  }
  return value.every(
    (m) =>
      m &&
      typeof m === "object" &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.length > 0 &&
      m.content.length <= MAX_MESSAGE_LENGTH
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { reply: RATE_LIMIT_MESSAGE, limited: true },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ reply: FALLBACK_MESSAGE }, { status: 400 });
  }

  const messages =
    body && typeof body === "object" && "messages" in body
      ? (body as { messages: unknown }).messages
      : undefined;

  if (!isValidMessages(messages)) {
    return NextResponse.json({ reply: FALLBACK_MESSAGE }, { status: 400 });
  }

  const userTurns = messages.filter((m) => m.role === "user").length;

  if (userTurns > MAX_USER_TURNS) {
    return NextResponse.json({ reply: TURN_LIMIT_MESSAGE, limited: true });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY manquante");
    return NextResponse.json({ reply: FALLBACK_MESSAGE }, { status: 500 });
  }

  const trimmed = messages.slice(-HISTORY_WINDOW);
  const systemPrompt = buildSystemPrompt(userTurns === MAX_USER_TURNS);

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: trimmed.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const reply =
      textBlock && "text" in textBlock ? textBlock.text.trim() : "";

    return NextResponse.json({
      reply: reply || FALLBACK_MESSAGE,
      limited: userTurns >= MAX_USER_TURNS,
    });
  } catch (err) {
    console.error(
      "Erreur API Anthropic:",
      err instanceof Error ? err.message : "erreur inconnue"
    );
    return NextResponse.json({ reply: FALLBACK_MESSAGE }, { status: 502 });
  }
}
