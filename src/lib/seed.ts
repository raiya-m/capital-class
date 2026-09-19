import { hashPassword } from "./hash";
import type {
  Classroom,
  Holding,
  Powerup,
  PricePoint,
  Profile,
  Reward,
  Sector,
  StoreData,
  Wallet,
} from "./types";

const CLASSROOM_ID = "class-room-4b";
const TEACHER_ID = "profile-teacher";
const ADMIN_ID = "profile-admin";

const students: { id: string; name: string; email: string }[] = [
  { id: "profile-mia", name: "Mia Chen", email: "mia@capitalclass.local" },
  { id: "profile-jordan", name: "Jordan Blake", email: "jordan@capitalclass.local" },
  { id: "profile-sam", name: "Sam Ortiz", email: "sam@capitalclass.local" },
  { id: "profile-priya", name: "Priya Shah", email: "priya@capitalclass.local" },
  { id: "profile-leo", name: "Leo Park", email: "leo@capitalclass.local" },
  { id: "profile-ava", name: "Ava Brooks", email: "ava@capitalclass.local" },
];

function mulberry(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function realisticWalk(start: number, days: number, vol: number, seed: number, dumps: number[]) {
  const rand = mulberry(seed);
  const prices = [Math.round(start * 100) / 100];
  for (let i = 1; i < days; i++) {
    let step = (rand() - 0.5) * vol * 2.4;
    if (dumps.includes(i + 1)) step = -0.035 - rand() * 0.045;
    else if (i % 11 === 4) step = 0.028 + rand() * 0.025;
    else if (i % 8 === 1) step = -0.012 - rand() * 0.02;
    const next = Math.max(58, Math.min(172, prices[i - 1] * (1 + step)));
    prices.push(Math.round(next * 100) / 100);
  }
  return prices;
}

const WALK_SPECS: { slug: Sector["slug"]; start: number; vol: number; seed: number; dumps: number[] }[] = [
  { slug: "technology", start: 121, vol: 0.017, seed: 11, dumps: [8, 21, 34, 45] },
  { slug: "agriculture", start: 112, vol: 0.019, seed: 23, dumps: [5, 17, 29, 41] },
  { slug: "transportation", start: 104, vol: 0.016, seed: 37, dumps: [11, 24, 38] },
  { slug: "energy", start: 126, vol: 0.02, seed: 41, dumps: [6, 18, 32, 46] },
  { slug: "healthcare", start: 98, vol: 0.014, seed: 53, dumps: [13, 27, 43] },
];

const WALKS: Record<string, number[]> = Object.fromEntries(
  WALK_SPECS.map((spec) => [spec.slug, realisticWalk(spec.start, 48, spec.vol, spec.seed, spec.dumps)]),
);

export const SECTORS: Sector[] = [
  { slug: "technology", name: "Technology", ticker: "CC-TECH", emoji: "", color: "#3B9AE1", price: WALKS.technology.at(-1)! },
  { slug: "agriculture", name: "Agriculture", ticker: "CC-FARM", emoji: "", color: "#3D9A6A", price: WALKS.agriculture.at(-1)! },
  { slug: "transportation", name: "Transportation", ticker: "CC-MOVE", emoji: "", color: "#E8B923", price: WALKS.transportation.at(-1)! },
  { slug: "energy", name: "Energy", ticker: "CC-PWR", emoji: "", color: "#E85D4C", price: WALKS.energy.at(-1)! },
  { slug: "healthcare", name: "Healthcare", ticker: "CC-CARE", emoji: "", color: "#8B5CF6", price: WALKS.healthcare.at(-1)! },
];

function history(): PricePoint[] {
  const points: PricePoint[] = [];
  for (const sector of SECTORS) {
    WALKS[sector.slug].forEach((price, i) => {
      points.push({ sectorSlug: sector.slug, day: i + 1, price });
    });
  }
  return points;
}

export const POWERUPS: Powerup[] = [
  {
    id: "pu-double",
    name: "Lucky Lightning",
    description: "Double your profits on the next market day.",
    emoji: "",
    kind: "double_gain",
    costCash: 150,
  },
  {
    id: "pu-shield",
    name: "Safety Net",
    description: "If you lose money next market day, keep half of the loss.",
    emoji: "",
    kind: "half_loss",
    costCash: 120,
  },
];

export function createSeed(): StoreData {
  const studentHash = hashPassword("student");
  const classroom: Classroom = {
    id: CLASSROOM_ID,
    teacherId: TEACHER_ID,
    name: "Room 4B",
    joinCode: "CLASS4B",
    tokenCashRate: 100,
    goalReturnPct: 1.2,
    goalDeadline: "2026-10-31",
    marketDay: 48,
    baselineClassValue: 10000,
    pendingTick: null,
    lastIntradayAt: 0,
    intradayStep: 0,
  };

  const admin: Profile = {
    id: ADMIN_ID,
    classroomId: null,
    role: "admin",
    displayName: "Alex Rivera",
    email: "admin@capitalclass.local",
    passwordHash: hashPassword("admin"),
  };

  const teacher: Profile = {
    id: TEACHER_ID,
    classroomId: CLASSROOM_ID,
    role: "teacher",
    displayName: "Ms. Patel",
    email: "teacher@capitalclass.local",
    passwordHash: hashPassword("teacher"),
  };

  const profiles: Profile[] = [
    admin,
    teacher,
    ...students.map((s) => ({
      id: s.id,
      classroomId: CLASSROOM_ID,
      role: "student" as const,
      displayName: s.name,
      email: s.email,
      passwordHash: studentHash,
    })),
  ];

  const wallets: Wallet[] = students.map((s, i) => ({
    profileId: s.id,
    unspentTokens: [4, 2, 6, 1, 3, 5][i],
    savingsTokens: [8, 12, 3, 15, 6, 9][i],
    investmentCash: [240, 80, 510, 40, 190, 330][i],
    lastSeenMarketDay: 48,
    lastTickSummary: null,
  }));

  const holdings: Holding[] = [
    { studentId: "profile-mia", sectorSlug: "technology", shares: 8 },
    { studentId: "profile-mia", sectorSlug: "healthcare", shares: 4 },
    { studentId: "profile-jordan", sectorSlug: "agriculture", shares: 10 },
    { studentId: "profile-jordan", sectorSlug: "energy", shares: 3 },
    { studentId: "profile-sam", sectorSlug: "technology", shares: 12 },
    { studentId: "profile-sam", sectorSlug: "transportation", shares: 6 },
    { studentId: "profile-priya", sectorSlug: "healthcare", shares: 9 },
    { studentId: "profile-leo", sectorSlug: "energy", shares: 7 },
    { studentId: "profile-leo", sectorSlug: "agriculture", shares: 5 },
    { studentId: "profile-ava", sectorSlug: "transportation", shares: 8 },
    { studentId: "profile-ava", sectorSlug: "technology", shares: 5 },
  ];

  const rewards: Reward[] = [
    {
      id: "rw-stickers",
      classroomId: CLASSROOM_ID,
      title: "Sticker Pack",
      description: "A shiny pack of classroom stickers.",
      tokenCost: 4,
      emoji: "",
      active: true,
    },
    {
      id: "rw-homework",
      classroomId: CLASSROOM_ID,
      title: "Homework Pass",
      description: "Skip one homework assignment this week.",
      tokenCost: 12,
      emoji: "",
      active: true,
    },
    {
      id: "rw-line",
      classroomId: CLASSROOM_ID,
      title: "Line Leader",
      description: "Be first in line for a day.",
      tokenCost: 6,
      emoji: "",
      active: true,
    },
    {
      id: "rw-recess",
      classroomId: CLASSROOM_ID,
      title: "Extra Recess",
      description: "Five bonus minutes of recess for you.",
      tokenCost: 10,
      emoji: "",
      active: true,
    },
  ];

  return {
    version: 11,
    classrooms: [classroom],
    profiles,
    wallets,
    tokenLedger: [
      {
        id: "led-1",
        classroomId: CLASSROOM_ID,
        studentId: "profile-mia",
        teacherId: TEACHER_ID,
        amount: 2,
        reason: "Helped a classmate",
        createdAt: new Date().toISOString(),
      },
      {
        id: "led-2",
        classroomId: CLASSROOM_ID,
        studentId: "profile-sam",
        teacherId: TEACHER_ID,
        amount: 3,
        reason: "Excellent group work",
        createdAt: new Date().toISOString(),
      },
    ],
    sectors: SECTORS.map((s) => ({ ...s })),
    prices: history(),
    news: [
      {
        id: "news-1",
        classroomId: CLASSROOM_ID,
        day: 48,
        headline: "Robot book-finders zip through the library",
        body: "A friendly fleet of shelf robots handed kids the right books in seconds. Coding clubs and gadget shops around town are buzzing.",
        impacts: { technology: 0.041, healthcare: 0.008 },
      },
      {
        id: "news-2",
        classroomId: CLASSROOM_ID,
        day: 48,
        headline: "Prize pumpkins wait an extra sunny day",
        body: "Farmers let giant pumpkins ripen on the vine. Smoothie shops still have berries, but farm stalls were quieter this morning.",
        impacts: { agriculture: -0.027 },
      },
      {
        id: "news-3",
        classroomId: CLASSROOM_ID,
        day: 48,
        headline: "New bike lanes link three neighborhoods",
        body: "Families can roll to parks more easily. Bus barns are testing quieter electric routes for field trips.",
        impacts: { transportation: 0.022, energy: 0.014 },
      },
    ],
    questions: [
      {
        id: "q-48",
        classroomId: CLASSROOM_ID,
        day: 48,
        prompt: "After today's news, which sector is most likely to rise?",
        options: SECTORS.map((s) => ({ sector: s.slug, label: s.name })),
        correctSector: "technology",
        rewardCash: 50,
      },
    ],
    answers: [],
    holdings,
    trades: [],
    rewards,
    redemptions: [
      {
        id: "rd-1",
        classroomId: CLASSROOM_ID,
        studentId: "profile-priya",
        rewardId: "rw-stickers",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        id: "rd-2",
        classroomId: CLASSROOM_ID,
        studentId: "profile-jordan",
        rewardId: "rw-line",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    ],
    powerupCatalog: POWERUPS,
    studentPowerups: [
      {
        id: "sp-1",
        studentId: "profile-mia",
        powerupId: "pu-double",
        charges: 1,
      },
    ],
  };
}
