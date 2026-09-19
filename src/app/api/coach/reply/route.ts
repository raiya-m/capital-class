import { getSessionProfile } from "@/lib/auth";
import { NextResponse } from "next/server";

type Body = { message?: string; context?: string };

function localReply(message: string, context: string) {
  const q = message.toLowerCase();
  if (q.includes("diversif") || q.includes("all")) {
    return "Spread tokens across at least two sectors so one news incident cannot sink the whole portfolio.";
  }
  if (q.includes("news") || q.includes("incident") || q.includes("bulletin")) {
    return "Read the green and red chips on the bulletin. Buy the sector the story helps, or wait if the jump already happened.";
  }
  if (q.includes("rank") || q.includes("goal")) {
    return "Rank follows portfolio value. Tokens in savings do not help the class investment goal — only invested cash and shares do.";
  }
  if (q.includes("power") || q.includes("lightning") || q.includes("safety")) {
    return "Lucky Lightning doubles the next up day. Safety Net halves the next down day. Buy them before the teacher breaks news.";
  }
  if (q.includes("sell") || q.includes("buy")) {
    return "Prices wiggle live. News incidents make the bigger jumps. Size buys so you still have cash for the next bulletin.";
  }
  if (context) {
    return `Here is a classroom-safe take: ${context} Keep it pretend money, and match your trades to the latest incident.`;
  }
  return "Look at the trend chart, then the latest incident. Trade with the story, not against a surprise jump.";
}

export async function POST(request: Request) {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "auth" }, { status: 401 });
  const { message, context } = (await request.json()) as Body;
  const text = (message ?? "").trim();
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ text: localReply(text, context ?? "") });
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are CapitalClass Coach for kids 8-14. Two or three short sentences. No real financial advice, no politics, no scares. Use their classroom snapshot if given.",
          },
          { role: "user", content: `Snapshot: ${context ?? "none"}\nStudent asked: ${text}` },
        ],
      }),
    });
    if (!res.ok) return NextResponse.json({ text: localReply(text, context ?? "") });
    const json = await res.json();
    const spoken = json.choices?.[0]?.message?.content?.trim() || localReply(text, context ?? "");
    return NextResponse.json({ text: spoken });
  } catch {
    return NextResponse.json({ text: localReply(text, context ?? "") });
  }
}
