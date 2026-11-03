import { NextResponse } from "next/server";
import { chat, ChatMessage } from "@/lib/gemini";
import { SpotWithWind } from "@/lib/spots";
import { LIMITS, checkChatBody, clientIp, rateLimited } from "@/lib/aiGuard";

// Cheap availability probe for the chat panel — reports key presence without
// spending a Gemini generation (the panel used to POST a throwaway "ping").
export async function GET() {
  return NextResponse.json({ available: !!process.env.GEMINI_API_KEY });
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }
  if (rateLimited(clientIp(req.headers))) {
    return NextResponse.json({ error: "Too many requests, try again later" }, { status: 429 });
  }

  try {
    const body = await req.json() as {
      messages:     ChatMessage[];
      spots:        SpotWithWind[];
      userProfile?: { heightCm: number; weightKg: number };
    };

    const { spots, userProfile } = body;
    const messages = Array.isArray(body.messages) ? body.messages.slice(-LIMITS.chatMessages) : body.messages;
    const invalid = checkChatBody(messages, spots);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const reply = await chat(messages, spots, userProfile);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Gemini chat error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
