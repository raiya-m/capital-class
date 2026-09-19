import { getSessionProfile } from "@/lib/auth";
import { NextResponse } from "next/server";

const MODEL = process.env.DEEPGRAM_TTS_MODEL || "aura-2-asteria-en";

export async function POST(request: Request) {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "auth" }, { status: 401 });

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "missing_key" }, { status: 501 });
  }

  const { text } = (await request.json()) as { text?: string };
  const spoken = (text ?? "").replace(/\s+/g, " ").trim().slice(0, 800);
  if (!spoken) return NextResponse.json({ error: "empty" }, { status: 400 });

  const res = await fetch(`https://api.deepgram.com/v1/speak?model=${encodeURIComponent(MODEL)}&encoding=mp3`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ text: spoken }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: "deepgram_failed", detail: detail.slice(0, 200) }, { status: 502 });
  }

  const audio = await res.arrayBuffer();
  return new NextResponse(audio, {
    headers: {
      "content-type": "audio/mpeg",
      "cache-control": "no-store",
    },
  });
}
