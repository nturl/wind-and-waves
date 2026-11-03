import { NextResponse } from "next/server";
import { chat, ChatMessage } from "@/lib/gemini";
import { SpotWithWind } from "@/lib/spots";
import { checkChatBody, clientIp, clipChat, num, rateLimited, trimSpots } from "@/lib/aiGuard";

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

    const messages = clipChat(body.messages);
    const invalid = checkChatBody(messages, body.spots);
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

    const heightCm = num(body.userProfile?.heightCm);
    const weightKg = num(body.userProfile?.weightKg);
    const userProfile = heightCm && weightKg ? { heightCm, weightKg } : undefined;
    const spots = trimSpots(body.spots) as unknown as SpotWithWind[];

    const reply = await chat(messages as ChatMessage[], spots, userProfile);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Gemini chat error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
