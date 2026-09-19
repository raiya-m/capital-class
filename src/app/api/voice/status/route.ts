import { getSessionProfile } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "auth" }, { status: 401 });
  return NextResponse.json({
    tts: Boolean(process.env.DEEPGRAM_API_KEY),
    stt: Boolean(process.env.DEEPGRAM_API_KEY),
  });
}
