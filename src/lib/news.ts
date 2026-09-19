import type { PendingTick, SectorSlug } from "./types";
import { SECTORS } from "./seed";
import { clamp } from "./utils";

const SYSTEM = `You write fictional classroom-safe market news for kids ages 8-14.
Rules:
- No politics, violence, scares, real company bashing, or real financial advice.
- Short sentences. Cheerful, mascot-friendly tone.
- Stories are made-up and clearly about kid-friendly events (schools, farms, parks, weather, robots, sports).
- Each story maps to 1-2 sectors with bounded price moves between -0.06 and 0.06.
- Sectors: technology, agriculture, transportation, energy, healthcare.
Return JSON only.`;

const PACKS: Omit<PendingTick, "projectedPrices">[] = [
  {
    news: [
      {
        headline: "Solar backpacks light up the science fair",
        body: "Kids charged tablets with sunny backpacks. The gym looked like a constellation of tiny lamps.",
        impacts: { energy: 0.04, technology: 0.02 },
      },
      {
        headline: "Berry crop is extra juicy this week",
        body: "Farmers shared strawberries with the cafeteria. Smoothie day is back on the menu.",
        impacts: { agriculture: 0.03 },
      },
      {
        headline: "Ferry traffic slows after foggy morning",
        body: "Boats waited for the sky to clear. Field trips still happened, just a little later.",
        impacts: { transportation: -0.03 },
      },
    ],
    question: {
      prompt: "Which sector got the brightest news today?",
      options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
      correctSector: "energy",
      rewardCash: 50,
    },
  },
  {
    news: [
      {
        headline: "Clinic opens a Saturday wellness club",
        body: "Nurses taught stretching games. Families signed up for check-in stickers.",
        impacts: { healthcare: 0.04 },
      },
      {
        headline: "Delivery drones drop library books",
        body: "A test route brought picture books to the playground. Tech club took notes.",
        impacts: { technology: 0.03, transportation: 0.02 },
      },
      {
        headline: "Wind knocks over a corn maze sign",
        body: "The maze is still open, but some stalks need tying. Farmers asked for extra helpers.",
        impacts: { agriculture: -0.02 },
      },
    ],
    question: {
      prompt: "If you had to invest after this news, which sector looks strongest?",
      options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
      correctSector: "healthcare",
      rewardCash: 50,
    },
  },
  {
    news: [
      {
        headline: "City adds electric school buses",
        body: "Quieter buses arrived with big batteries. Drivers practiced the new dashboard.",
        impacts: { transportation: 0.04, energy: 0.02 },
      },
      {
        headline: "Coding club builds a weather app",
        body: "Students predicted recess rain with a simple chart. Other classes want the app too.",
        impacts: { technology: 0.03 },
      },
      {
        headline: "Flu season posters remind everyone to wash hands",
        body: "The nurse's office is busy but calm. Extra soap arrived this morning.",
        impacts: { healthcare: 0.01, agriculture: -0.01 },
      },
    ],
    question: {
      prompt: "Which sector is most likely to go up after today's stories?",
      options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
      correctSector: "transportation",
      rewardCash: 50,
    },
  },
];

function projectPrices(
  current: Record<SectorSlug, number>,
  news: PendingTick["news"],
): Record<SectorSlug, number> {
  const impacts: Record<string, number> = {};
  for (const item of news) {
    for (const [slug, value] of Object.entries(item.impacts)) {
      impacts[slug] = (impacts[slug] ?? 0) + (value ?? 0);
    }
  }
  const next = { ...current };
  for (const slug of Object.keys(current) as SectorSlug[]) {
    const move = clamp(impacts[slug] ?? 0, -0.12, 0.12);
    next[slug] = Math.round(current[slug] * (1 + move) * 100) / 100;
  }
  return next;
}

function withPrices(
  pack: Omit<PendingTick, "projectedPrices">,
  current: Record<SectorSlug, number>,
): PendingTick {
  const best = Object.entries(
    pack.news.reduce(
      (acc, item) => {
        for (const [k, v] of Object.entries(item.impacts)) {
          acc[k] = (acc[k] ?? 0) + (v ?? 0);
        }
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).sort((a, b) => b[1] - a[1])[0]?.[0] as SectorSlug;

  return {
    news: pack.news,
    question: { ...pack.question, correctSector: best ?? pack.question.correctSector },
    projectedPrices: projectPrices(current, pack.news),
  };
}

export function cannedTick(
  day: number,
  current: Record<SectorSlug, number>,
): PendingTick {
  return withPrices(PACKS[day % PACKS.length], current);
}

export async function generateTick(
  day: number,
  current: Record<SectorSlug, number>,
): Promise<PendingTick> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return cannedTick(day, current);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Create 3 news stories and one multiple-choice question. JSON shape:
{"news":[{"headline":"","body":"","impacts":{"technology":0.02}}],"question":{"prompt":"","correctSector":"technology","rewardCash":50}}
Impacts keys must be sector slugs. Keep 3 stories.`,
          },
        ],
      }),
    });
    if (!res.ok) return cannedTick(day, current);
    const json = await res.json();
    const parsed = JSON.parse(json.choices[0].message.content) as {
      news: PendingTick["news"];
      question: { prompt: string; correctSector: SectorSlug; rewardCash?: number };
    };
    const pack: Omit<PendingTick, "projectedPrices"> = {
      news: parsed.news.slice(0, 3).map((n) => ({
        headline: n.headline,
        body: n.body,
        impacts: Object.fromEntries(
          Object.entries(n.impacts).map(([k, v]) => [k, clamp(Number(v) || 0, -0.06, 0.06)]),
        ),
      })),
      question: {
        prompt: parsed.question.prompt,
        options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
        correctSector: parsed.question.correctSector,
        rewardCash: parsed.question.rewardCash ?? 50,
      },
    };
    return withPrices(pack, current);
  } catch {
    return cannedTick(day, current);
  }
}
