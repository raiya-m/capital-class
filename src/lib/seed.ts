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

export const SECTORS: Sector[] = [
  { slug: "technology", name: "Technology", emoji: "💻", color: "#3B9AE1", price: 112 },
  { slug: "agriculture", name: "Agriculture", emoji: "🌾", color: "#3D9A6A", price: 97 },
  { slug: "transportation", name: "Transportation", emoji: "🚚", color: "#E8B923", price: 104 },
  { slug: "energy", name: "Energy", emoji: "⚡", color: "#E85D4C", price: 108 },
  { slug: "healthcare", name: "Healthcare", emoji: "🩺", color: "#8B5CF6", price: 101 },
];

const students: { id: string; name: string; email: string }[] = [
  { id: "profile-mia", name: "Mia Chen", email: "mia@capitalclass.local" },
  { id: "profile-jordan", name: "Jordan Blake", email: "jordan@capitalclass.local" },
  { id: "profile-sam", name: "Sam Ortiz", email: "sam@capitalclass.local" },
  { id: "profile-priya", name: "Priya Shah", email: "priya@capitalclass.local" },
  { id: "profile-leo", name: "Leo Park", email: "leo@capitalclass.local" },
  { id: "profile-ava", name: "Ava Brooks", email: "ava@capitalclass.local" },
];

function history(): PricePoint[] {
  const paths: Record<string, number[]> = {
    technology: [100, 102, 101, 105, 108, 107, 110, 112],
    agriculture: [100, 99, 101, 100, 98, 96, 95, 97],
    transportation: [100, 101, 103, 102, 104, 106, 105, 104],
    energy: [100, 103, 104, 102, 106, 109, 107, 108],
    healthcare: [100, 100, 102, 103, 101, 99, 100, 101],
  };
  const points: PricePoint[] = [];
  for (const sector of SECTORS) {
    paths[sector.slug].forEach((price, i) => {
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
    emoji: "⚡",
    kind: "double_gain",
    costCash: 150,
  },
  {
    id: "pu-shield",
    name: "Safety Net",
    description: "If you lose money next market day, keep half of the loss.",
    emoji: "🛡️",
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
    marketDay: 8,
    baselineClassValue: 5000,
    pendingTick: null,
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
    lastSeenMarketDay: s.id === "profile-mia" ? 7 : 8,
    lastTickSummary:
      s.id === "profile-mia"
        ? {
            day: 8,
            portfolioDelta: 42,
            powerupNotes: ["Lucky Lightning is ready for the next market day."],
            qotdCorrect: null,
            rank: 2,
            classmateCount: 6,
          }
        : null,
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
      emoji: "⭐",
      active: true,
    },
    {
      id: "rw-homework",
      classroomId: CLASSROOM_ID,
      title: "Homework Pass",
      description: "Skip one homework assignment this week.",
      tokenCost: 12,
      emoji: "🎫",
      active: true,
    },
    {
      id: "rw-line",
      classroomId: CLASSROOM_ID,
      title: "Line Leader",
      description: "Be first in line for a day.",
      tokenCost: 6,
      emoji: "🚶",
      active: true,
    },
    {
      id: "rw-recess",
      classroomId: CLASSROOM_ID,
      title: "Extra Recess",
      description: "Five bonus minutes of recess for you.",
      tokenCost: 10,
      emoji: "🏀",
      active: true,
    },
  ];

  return {
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
    sectors: SECTORS,
    prices: history(),
    news: [
      {
        id: "news-1",
        classroomId: CLASSROOM_ID,
        day: 8,
        headline: "Robot helpers roll into school libraries",
        body: "A friendly fleet of book-finding robots made reading time faster. Tech workshops around town are buzzing.",
        impacts: { technology: 0.03, healthcare: 0.01 },
      },
      {
        id: "news-2",
        classroomId: CLASSROOM_ID,
        day: 8,
        headline: "Rain delays the giant pumpkin harvest",
        body: "Farmers waited extra days to pick prize pumpkins. Grocery shops still have plenty of apples, though.",
        impacts: { agriculture: -0.02 },
      },
      {
        id: "news-3",
        classroomId: CLASSROOM_ID,
        day: 8,
        headline: "New bike lanes connect three neighborhoods",
        body: "Families can ride to parks more safely. Bus companies are planning brighter, quieter routes too.",
        impacts: { transportation: 0.02, energy: 0.01 },
      },
    ],
    questions: [
      {
        id: "q-8",
        classroomId: CLASSROOM_ID,
        day: 8,
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
