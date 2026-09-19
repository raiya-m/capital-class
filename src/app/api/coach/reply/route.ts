import { getSessionProfile } from "@/lib/auth";
import { liveCoachBriefing } from "@/lib/coach-briefing";
import { NextResponse } from "next/server";

type Turn = { role?: string; text?: string };
type Body = { message?: string; history?: Turn[] };

function localReply(message: string, briefing: string) {
  const q = message.toLowerCase();
  const newsLine = briefing.split("\n").find((line) => line.startsWith("Today's incident bulletin:")) ?? "";
  if (q.includes("diversif") || q.includes("all")) {
    return "Think of your shares like snacks in a lunchbox. If you put everything in one sector, one news story can mess up the whole day. Spread your next buy into a second sector.";
  }
  if (q.includes("news") || q.includes("incident") || q.includes("bulletin")) {
    return newsLine
      ? `Here is today's class news: ${newsLine.replace("Today's incident bulletin: ", "")} If a story helps a sector, that is usually the one to look at. If it already jumped a lot, it is okay to wait.`
      : "Read today's class news first. Green chips mean that sector had good news. Red chips mean it had a tough day.";
  }
  if (q.includes("rank") || q.includes("goal")) {
    return "The class list is about the pretend money you invested, not tokens you saved for rewards. Savings tokens buy stickers and passes. Invested dollars help the class goal.";
  }
  if (q.includes("power") || q.includes("lightning") || q.includes("safety")) {
    return "Lucky Lightning makes a good day twice as nice. Safety Net makes a bad day hurt half as much. Get one before your teacher posts a surprise story.";
  }
  if (q.includes("sell") || q.includes("buy")) {
    return "Check what you already own, then read the news. Buy a little of the sector the story helps, and keep some cash for the next story.";
  }
  return "Look at today's news and the sectors you already own. This is class practice money, so the point is to notice why a price moved.";
}

export async function POST(request: Request) {
  const profile = await getSessionProfile();
  if (!profile) return NextResponse.json({ error: "auth" }, { status: 401 });
  if (profile.role !== "student") {
    return NextResponse.json({ error: "students_only" }, { status: 403 });
  }

  const { message, history } = (await request.json()) as Body;
  const text = (message ?? "").trim();
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });

  let briefing = "";
  try {
    briefing = await liveCoachBriefing();
  } catch {
    briefing = "Live classroom tape could not be loaded.";
  }

  const fallback = localReply(text, briefing);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ text: fallback, source: "local" });
  }

  const prior = (history ?? [])
    .filter((t) => t.text)
    .slice(-8)
    .map((t) => ({
      role: t.role === "you" ? ("user" as const) : ("assistant" as const),
      content: String(t.text),
    }));

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.55,
        max_tokens: 220,
        messages: [
          {
            role: "system",
            content: `You are Ms. Coach, a warm middle school teacher for CapitalClass, a pretend classroom market for grades 6-8.

Talk like you are explaining something at the board, not like a banker. Use everyday words. If you must use a market word (share, sector, percent), explain it in the same breath.

Voice:
- Sound like a patient teacher: encouraging, clear, a little upbeat.
- Short sentences. Two to four of them. Easy to hear out loud.
- You may say the student's first name.
- No slang that feels adult-finance: no "positions", "tape", "alpha", "exposure", "liquidity", "thesis", "print", "book".
- Prefer: news story, class dollars, shares you own, up or down, good day / tough day, spread your choices.

What you know:
You get a live briefing with this student's money, the shares they own, every sector price, today's class news, older news, the guessing question, power-ups, and class rank. Use those facts so the answer is about THEIR class, not a generic tip. Mention a headline or a sector they actually own when it helps.

Rules:
- This is pretend class money. Say that if they ask about real investing.
- Never give real financial advice, never scare them, no politics, no emojis.
- If they are worried about a drop, normalize it: markets in class go up and down so we can learn why.
- End with a tiny next step they can do (read the news, check one sector, keep some cash).`,
          },
          {
            role: "user",
            content: `Live CapitalClass briefing:\n${briefing}`,
          },
          ...prior,
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ text: fallback, source: "local" });
    }
    const json = await res.json();
    const spoken = json.choices?.[0]?.message?.content?.trim() || fallback;
    return NextResponse.json({ text: spoken, source: "openai" });
  } catch {
    return NextResponse.json({ text: fallback, source: "local" });
  }
}
