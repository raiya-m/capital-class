import { getSessionProfile } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "auth" }, { status: 401 });

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "missing_key" }, { status: 501 });
  }

  const audio = await request.arrayBuffer();
  if (!audio.byteLength) return NextResponse.json({ error: "empty" }, { status: 400 });

  const contentType = request.headers.get("content-type") || "audio/webm";
  const res = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "content-type": contentType,
    },
    body: audio,
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: "deepgram_failed", detail: detail.slice(0, 200) }, { status: 502 });
  }

  const json = (await res.json()) as {
    results?: { channels?: { alternatives?: { transcript?: string }[] }[] };
  };
  const transcript = json.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? "";
  return NextResponse.json({ transcript });
}
