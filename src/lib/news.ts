import type { PendingTick, SectorSlug, StoreData } from "./types";
import { SECTORS } from "./seed";
import { clamp } from "./utils";

const SYSTEM = `You write fictional classroom-safe market news for kids ages 8-14.
Rules:
- No politics, violence, scares, illness scares, real company bashing, or real financial advice.
- Each pack must include at least one drop (negative impact). Real markets go down too.
- Made-up classroom incidents: science fairs, farms, parks, weather, robots, sports, school clubs.
- Each story maps to 1-2 sectors with bounded moves between -0.07 and 0.06.
- Sectors: technology, agriculture, transportation, energy, healthcare.
Return JSON only.`;

const PACKS: Omit<PendingTick, "projectedPrices">[] = [
  {
    news: [
      {
        headline: "Solar backpacks steal the science-fair spotlight",
        body: "Kids charged tablets from sunny backpacks. The gym looked like a constellation of tiny lamps, and energy club sign-ups filled up.",
        impacts: { energy: 0.048, technology: 0.019 },
      },
      {
        headline: "Berry crop is extra juicy this week",
        body: "Farmers rolled strawberries into the cafeteria. Smoothie day is back, and farm stands had lines at recess.",
        impacts: { agriculture: 0.031 },
      },
      {
        headline: "Morning fog parks the river ferry",
        body: "Boats waited for the sky to clear. Field trips still happened — just a little later — so transit desks marked a slow open.",
        impacts: { transportation: -0.028 },
      },
    ],
    question: {
      prompt: "Which sector should pop after the science-fair story?",
      options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
      correctSector: "energy",
      rewardCash: 50,
    },
  },
  {
    news: [
      {
        headline: "Clinic opens a Saturday stretching club",
        body: "Nurses taught silly warm-ups. Families grabbed wellness stickers, and the nurse's office looked extra busy in a good way.",
        impacts: { healthcare: 0.044 },
      },
      {
        headline: "Delivery drones drop library holds on the playground",
        body: "A test route brought picture books to recess. Tech club timed the landings and sketched a faster map.",
        impacts: { technology: 0.036, transportation: 0.018 },
      },
      {
        headline: "Breeze tips a corn-maze arrow",
        body: "The maze is still open. Farmers asked for extra helpers to retie stalks, so harvest work ran a little behind.",
        impacts: { agriculture: -0.021 },
      },
    ],
    question: {
      prompt: "If you had to buy one sector after this bulletin, which looks strongest?",
      options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
      correctSector: "healthcare",
      rewardCash: 50,
    },
  },
  {
    news: [
      {
        headline: "Electric school buses hum onto the lot",
        body: "Quieter buses arrived with big batteries. Drivers practiced the new dashboards before afternoon pickup.",
        impacts: { transportation: 0.042, energy: 0.02 },
      },
      {
        headline: "Coding club ships a recess-weather app",
        body: "Students predicted kickball rain with a simple chart. Three other classes asked for the link.",
        impacts: { technology: 0.033 },
      },
      {
        headline: "Hand-washing song contest in the cafeteria",
        body: "The nurse posted a catchy chorus. Extra soap arrived, and wellness posters went up by the sinks.",
        impacts: { healthcare: 0.012 },
      },
    ],
    question: {
      prompt: "Which sector is most likely to tick up after the bus story?",
      options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
      correctSector: "transportation",
      rewardCash: 50,
    },
  },
  {
    news: [
      {
        headline: "Wind hill spins extra after a breezy weekend",
        body: "The town turbines hummed all Sunday. Science class measured the gusts and sent a proud graph to the office.",
        impacts: { energy: 0.052 },
      },
      {
        headline: "Tomato crates arrive a day late for pizza Friday",
        body: "The cafeteria still served cheese slices. Farm trucks hit extra traffic, so produce desks dipped for the morning.",
        impacts: { agriculture: -0.018, transportation: -0.01 },
      },
      {
        headline: "Robot vacuums win the hallway-clean contest",
        body: "Little bots zigzagged glitter off the tiles. Gadget club posted a how-to and the crowd cheered.",
        impacts: { technology: 0.027 },
      },
    ],
    question: {
      prompt: "Which sector got the biggest boost from this incident pack?",
      options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
      correctSector: "energy",
      rewardCash: 50,
    },
  },
  {
    news: [
      {
        headline: "Tablet cart wifi drops during math block",
        body: "Three classes waited on a frozen login screen. Tech club is tracing the glitch, and gadget desks marked a weak open.",
        impacts: { technology: -0.058 },
      },
      {
        headline: "Hail dents the pumpkin patch overnight",
        body: "The jumbo pumpkins are still there, just bumpier. Farm stands delayed snack deliveries until they sort the crates.",
        impacts: { agriculture: -0.062, transportation: -0.016 },
      },
      {
        headline: "Nurse restocks ice packs after field day",
        body: "Stretching club ran extra cool-downs. Wellness stickers still went out, so health desks held up better than farms.",
        impacts: { healthcare: 0.018 },
      },
    ],
    question: {
      prompt: "Which sector took the hardest hit from this bulletin?",
      options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
      correctSector: "agriculture",
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
  const slugs = Object.keys(current) as SectorSlug[];
  if (!Object.values(impacts).some((v) => v < 0) && slugs.length) {
    const victim = slugs[Math.floor(Math.random() * slugs.length)]!;
    impacts[victim] = (impacts[victim] ?? 0) - (0.028 + Math.random() * 0.03);
  }
  for (const slug of slugs) {
    const newsMove = clamp(impacts[slug] ?? 0, -0.12, 0.12);
    const drift = (Math.random() - 0.55) * 0.016;
    next[slug] = Math.round(current[slug] * (1 + newsMove + drift) * 100) / 100;
  }
  return next;
}

function withPrices(
  pack: Omit<PendingTick, "projectedPrices">,
  current: Record<SectorSlug, number>,
): PendingTick {
  const totals = pack.news.reduce(
    (acc, item) => {
      for (const [k, v] of Object.entries(item.impacts)) {
        acc[k] = (acc[k] ?? 0) + (v ?? 0);
      }
      return acc;
    },
    {} as Record<string, number>,
  );
  const best = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] as SectorSlug;

  return {
    news: pack.news,
    question: { ...pack.question, correctSector: best ?? pack.question.correctSector },
    projectedPrices: projectPrices(current, pack.news),
    rationale: pack.news
      .map((n) => {
        const hit = Object.entries(n.impacts)
          .filter(([, v]) => Math.abs(v ?? 0) >= 0.01)
          .map(([k, v]) => `${k} ${((v ?? 0) * 100).toFixed(1)}%`)
          .join(", ");
        return hit;
      })
      .filter(Boolean)
      .join(" · "),
  };
}

export function cannedTick(day: number, current: Record<SectorSlug, number>): PendingTick {
  return withPrices(PACKS[Math.abs(day) % PACKS.length], current);
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
            content: `Create 3 classroom-safe news incidents and one question. JSON:
{"news":[{"headline":"","body":"","impacts":{"technology":0.03}}],"question":{"prompt":"","correctSector":"technology","rewardCash":50}}
Keep 3 stories. At least one impact must be negative. Impacts must use sector slugs.`,
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
          Object.entries(n.impacts).map(([k, v]) => [k, clamp(Number(v) || 0, -0.07, 0.06)]),
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

export function applyIntradayNoise(data: StoreData) {
  const now = Date.now();
  const classroom = data.classrooms[0];
  if (!classroom) return data.sectors;
  if (now - (classroom.lastIntradayAt || 0) < 3500) return data.sectors;

  classroom.lastIntradayAt = now;
  classroom.intradayStep = (classroom.intradayStep || 0) + 1;
  const stamp = classroom.marketDay + classroom.intradayStep / 200;
  const forcedDump = data.sectors[Math.floor(Math.random() * data.sectors.length)]?.slug;

  for (const sector of data.sectors) {
    if (!sector.ticker) {
      const match = SECTORS.find((s) => s.slug === sector.slug);
      if (match) sector.ticker = match.ticker;
    }
    const dailies = data.prices
      .filter((p) => p.sectorSlug === sector.slug && Number.isInteger(p.day))
      .sort((a, b) => a.day - b.day);
    const anchor = dailies[dailies.length - 1]?.price ?? sector.price;
    const dump =
      sector.slug === forcedDump || Math.random() < 0.28 ? -(0.02 + Math.random() * 0.04) : 0;
    const bounce = dump === 0 && Math.random() < 0.1 ? 0.006 + Math.random() * 0.014 : 0;
    const noise = (Math.random() - 0.54) * 0.01;
    let next = sector.price * (1 + noise + dump + bounce);
    next += (anchor - next) * 0.04;
    sector.price = Math.round(Math.max(anchor * 0.86, Math.min(anchor * 1.08, next)) * 100) / 100;
    data.prices.push({ sectorSlug: sector.slug, day: stamp, price: sector.price });
  }

  const keepIntra = 40;
  const bySlug = new Map<string, typeof data.prices>();
  for (const p of data.prices) {
    const list = bySlug.get(p.sectorSlug) ?? [];
    list.push(p);
    bySlug.set(p.sectorSlug, list);
  }
  data.prices = [...bySlug.values()].flatMap((list) => {
    list.sort((a, b) => a.day - b.day);
    const dailies = list.filter((p) => Number.isInteger(p.day));
    const intra = list.filter((p) => !Number.isInteger(p.day)).slice(-keepIntra);
    const merged = [...dailies, ...intra].sort((a, b) => a.day - b.day);
    const seen = new Set<string>();
    return merged.filter((p) => {
      const key = `${p.day}:${p.price}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  });
  return data.sectors;
}

const KEYWORDS: Record<SectorSlug, string[]> = {
  technology: ["robot", "app", "code", "computer", "drone", "gadget", "tablet", "wifi", "coding", "screen"],
  agriculture: ["farm", "crop", "pumpkin", "tomato", "berry", "garden", "harvest", "corn", "apple", "soil"],
  transportation: ["bus", "bike", "ferry", "traffic", "truck", "delivery", "lane", "scooter", "train"],
  energy: ["solar", "wind", "battery", "power", "cloudy", "turbine", "backpack", "lamp"],
  healthcare: ["nurse", "clinic", "stretch", "soap", "wellness", "sticker", "health", "recess"],
};

const NEGATIVE = ["delay", "late", "slow", "storm", "frost", "hail", "fog", "break", "miss", "wait", "dent", "cloudy", "nipped", "wilt"];
const POSITIVE = [
  "new",
  "win",
  "juicy",
  "record",
  "fast",
  "extra",
  "open",
  "bright",
  "quiet",
  "ripe",
  "hum",
  "warn",
  "saved",
  "timely",
  "fix",
  "helped",
];

function heuristicImpacts(text: string): Partial<Record<SectorSlug, number>> {
  const q = text.toLowerCase();
  const hasNeg = NEGATIVE.some((w) => q.includes(w));
  const hasPos = POSITIVE.some((w) => q.includes(w));
  const impacts: Partial<Record<SectorSlug, number>> = {};
  for (const [slug, words] of Object.entries(KEYWORDS) as [SectorSlug, string[]][]) {
    if (!words.some((w) => q.includes(w))) continue;
    let sign = 0.45;
    if (hasNeg && hasPos) {
      sign = slug === "agriculture" || slug === "healthcare" ? -1 : 1;
    } else if (hasNeg) sign = -1;
    else if (hasPos) sign = 1;
    impacts[slug] = clamp(sign * (0.032 + (q.split(slug).length % 3) * 0.01), -0.07, 0.07);
  }
  if (!Object.keys(impacts).length) {
    impacts.agriculture = -0.02;
    impacts.technology = 0.01;
  }
  return impacts;
}

export async function incidentFromTeacher(
  raw: string,
  current: Record<SectorSlug, number>,
): Promise<PendingTick> {
  const fallbackImpacts = heuristicImpacts(raw);
  const fallbackHeadline = raw.split(/[.!?]/)[0]?.slice(0, 90) || "Classroom market incident";
  const fallback: Omit<PendingTick, "projectedPrices"> = {
    news: [
      {
        headline: fallbackHeadline,
        body: `${raw.slice(0, 280)} The CapitalClass tape reprices from this classroom-safe story — not real money.`,
        impacts: fallbackImpacts,
      },
    ],
    question: {
      prompt: "Which sector should move the most after this incident?",
      options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
      correctSector: (Object.entries(fallbackImpacts).sort((a, b) => Math.abs(b[1] ?? 0) - Math.abs(a[1] ?? 0))[0]?.[0] ??
        "technology") as SectorSlug,
      rewardCash: 50,
    },
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return withPrices(fallback, current);

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
          {
            role: "system",
            content: `You are CapitalClass market AI for kids 8-14.
Teacher publishes a classroom incident. You decide how a pretend sector market should reprice.
Sectors: technology, agriculture, transportation, energy, healthcare.
Rules:
- Rewrite the incident as one kid-safe headline and 2 short sentences. No politics, violence, illness scares, or real financial advice.
- Assign an impact to every sector between -0.07 and 0.07. Unused sectors near 0.
- If the story is bad for farms, agriculture must drop. If robots/apps, technology likely rises. Be consistent.
- Pick correctSector as the sector with the largest absolute move.
JSON:
{"headline":"","body":"","impacts":{"technology":0,"agriculture":-0.04,"transportation":0,"energy":0,"healthcare":0},"rationale":"","correctSector":"agriculture","question":""}`,
          },
          { role: "user", content: `Teacher incident: ${raw.slice(0, 600)}` },
        ],
      }),
    });
    if (!res.ok) return withPrices(fallback, current);
    const json = await res.json();
    const parsed = JSON.parse(json.choices[0].message.content) as {
      headline: string;
      body: string;
      impacts: Partial<Record<SectorSlug, number>>;
      rationale?: string;
      correctSector?: SectorSlug;
      question?: string;
    };
    const impacts = Object.fromEntries(
      SECTORS.map((s) => [s.slug, clamp(Number(parsed.impacts?.[s.slug]) || 0, -0.07, 0.07)]),
    ) as Partial<Record<SectorSlug, number>>;
    const pack: Omit<PendingTick, "projectedPrices"> = {
      news: [
        {
          headline: parsed.headline || fallbackHeadline,
          body: parsed.body || fallback.news[0].body,
          impacts,
        },
      ],
      question: {
        prompt: parsed.question || "Which sector should move the most after this incident?",
        options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
        correctSector: parsed.correctSector ?? fallback.question.correctSector,
        rewardCash: 50,
      },
    };
    const tick = withPrices(pack, current);
    tick.rationale = parsed.rationale || tick.rationale;
    return tick;
  } catch {
    return withPrices(fallback, current);
  }
}
