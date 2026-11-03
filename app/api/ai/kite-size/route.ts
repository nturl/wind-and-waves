import { NextResponse } from "next/server";
import { recommendKiteSize } from "@/lib/gemini";
import { LIMITS, clientIp, num, rateLimited } from "@/lib/aiGuard";

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }
  if (rateLimited(clientIp(req.headers))) {
    return NextResponse.json({ error: "Too many requests, try again later" }, { status: 429 });
  }

  try {
    const body = await req.json() as Record<string, unknown>;
    const heightCm = num(body.heightCm);
    const weightKg = num(body.weightKg);
    const windAvg  = num(body.windAvg);
    const windGust = num(body.windGust);
    const spotName = body.spotName;

    if (!heightCm || !weightKg || windAvg == null) {
      return NextResponse.json({ error: "heightCm, weightKg, and windAvg are required" }, { status: 400 });
    }
    if (typeof spotName !== "string" || spotName.length > LIMITS.spotNameChars) {
      return NextResponse.json({ error: "bad spotName" }, { status: 400 });
    }

    const rec = await recommendKiteSize(heightCm, weightKg, windAvg, windGust, spotName);
    return NextResponse.json(rec);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
