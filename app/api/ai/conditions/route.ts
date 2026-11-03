import { NextResponse } from "next/server";
import { analyzeConditions, getRegionalSummaries } from "@/lib/gemini";
import { SpotWithWind } from "@/lib/spots";
import { LIMITS, clientIp, rateLimited, trimSpots } from "@/lib/aiGuard";

// Cache Gemini results for 20 min — no need to call on every page load
let cache: { verdicts: unknown; summaries: unknown; ts: number } | null = null;
const TTL = 20 * 60 * 1000;

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }

  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json({ verdicts: cache.verdicts, summaries: cache.summaries, cached: true });
  }
  if (rateLimited(clientIp(req.headers))) {
    return NextResponse.json({ error: "Too many requests, try again later" }, { status: 429 });
  }

  try {
    const raw: unknown = await req.json();
    if (!Array.isArray(raw) || raw.length > LIMITS.spots) {
      return NextResponse.json({ error: "too many spots" }, { status: 400 });
    }
    const spots = trimSpots(raw) as unknown as SpotWithWind[];
    const [verdicts, summaries] = await Promise.all([
      analyzeConditions(spots),
      getRegionalSummaries(spots),
    ]);

    cache = { verdicts, summaries, ts: Date.now() };
    return NextResponse.json({ verdicts, summaries, cached: false });
  } catch (err) {
    console.error("Gemini conditions error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
