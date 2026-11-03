// The /api/ai/* routes are public (the dashboard is a portfolio piece) and
// each POST spends a Gemini call on Noel's key. Two cheap guards keep a
// stranger from using them as a free, unbounded LLM proxy:
//  - size caps on what a request may send to Gemini;
//  - a per-IP limit. It lives in memory, so it is per serverless instance:
//    it stops a single client hammering one instance, not a distributed
//    attack. The hard ceiling is a quota on the Gemini key itself.
// No imports, so scripts/aiGuard.test.mjs can load it under plain node.

export const LIMITS = {
  // The panel resends the whole history each turn; the route keeps only the
  // last 19 (odd, so the kept turns still start with a user message).
  chatMessages: 19,
  messageChars: 2000,
  spots: 80,             // the dashboard sends ~40 spots
  spotNameChars: 100,
  requestsPerWindow: 30, // per IP, per instance
  windowMs: 10 * 60 * 1000,
};

type Msg = { role?: unknown; content?: unknown };

// Returns an error string, or null when the chat body is within bounds.
export function checkChatBody(messages: unknown, spots: unknown): string | null {
  if (!Array.isArray(messages) || messages.length === 0) return "messages required";
  if (messages.length > LIMITS.chatMessages) return "too many messages";
  for (const m of messages as Msg[]) {
    if (m?.role !== "user" && m?.role !== "model") return "bad message role";
    if (typeof m.content !== "string" || m.content.length > LIMITS.messageChars) return "message too long";
  }
  if (spots != null && (!Array.isArray(spots) || spots.length > LIMITS.spots)) return "too many spots";
  return null;
}

const hits = new Map<string, number[]>();

export function clientIp(headers: { get(name: string): string | null }): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
}

// True when this IP has used up its window; otherwise records the hit.
export function rateLimited(ip: string, now: number = Date.now()): boolean {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < LIMITS.windowMs);
  if (recent.length >= LIMITS.requestsPerWindow) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // bound memory on a long-lived instance
  return false;
}
