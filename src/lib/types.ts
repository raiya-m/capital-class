export type Role = "admin" | "teacher" | "student";

export type RedemptionStatus = "pending" | "approved" | "denied";

export type SectorSlug =
  | "technology"
  | "agriculture"
  | "transportation"
  | "energy"
  | "healthcare";

export type Classroom = {
  id: string;
  teacherId: string;
  name: string;
  joinCode: string;
  tokenCashRate: number;
  goalReturnPct: number;
  goalDeadline: string;
  marketDay: number;
  baselineClassValue: number;
  pendingTick: PendingTick | null;
  lastIntradayAt: number;
  intradayStep: number;
};

export type Profile = {
  id: string;
  classroomId: string | null;
  role: Role;
  displayName: string;
  email: string;
  passwordHash: string;
};

export type Wallet = {
  profileId: string;
  unspentTokens: number;
  savingsTokens: number;
  investmentCash: number;
  lastSeenMarketDay: number;
  lastTickSummary: TickSummary | null;
};

export type TokenLedgerEntry = {
  id: string;
  classroomId: string;
  studentId: string;
  teacherId: string;
  amount: number;
  reason: string;
  createdAt: string;
};

export type Sector = {
  slug: SectorSlug;
  name: string;
  ticker: string;
  emoji: string;
  color: string;
  price: number;
};

export type PricePoint = {
  sectorSlug: SectorSlug;
  day: number;
  price: number;
};

export type NewsItem = {
  id: string;
  classroomId: string;
  day: number;
  headline: string;
  body: string;
  impacts: Partial<Record<SectorSlug, number>>;
};

export type DailyQuestion = {
  id: string;
  classroomId: string;
  day: number;
  prompt: string;
  options: { sector: SectorSlug; label: string }[];
  correctSector: SectorSlug;
  rewardCash: number;
};

export type Answer = {
  id: string;
  questionId: string;
  studentId: string;
  sector: SectorSlug;
  correct: boolean;
  createdAt: string;
};

export type Holding = {
  studentId: string;
  sectorSlug: SectorSlug;
  shares: number;
};

export type Trade = {
  id: string;
  studentId: string;
  sectorSlug: SectorSlug;
  side: "buy" | "sell";
  shares: number;
  price: number;
  createdAt: string;
};

export type Reward = {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  tokenCost: number;
  emoji: string;
  active: boolean;
};

export type Redemption = {
  id: string;
  classroomId: string;
  studentId: string;
  rewardId: string;
  status: RedemptionStatus;
  createdAt: string;
};

export type Powerup = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  kind: "double_gain" | "half_loss";
  costCash: number;
};

export type StudentPowerup = {
  id: string;
  studentId: string;
  powerupId: string;
  charges: number;
};

export type TickSummary = {
  day: number;
  portfolioDelta: number;
  powerupNotes: string[];
  qotdCorrect: boolean | null;
  rank: number;
  classmateCount: number;
};

export type PendingTick = {
  news: Omit<NewsItem, "id" | "classroomId" | "day">[];
  question: Omit<DailyQuestion, "id" | "classroomId" | "day">;
  projectedPrices: Partial<Record<SectorSlug, number>>;
  rationale?: string;
};

export type StoreData = {
  version: number;
  classrooms: Classroom[];
  profiles: Profile[];
  wallets: Wallet[];
  tokenLedger: TokenLedgerEntry[];
  sectors: Sector[];
  prices: PricePoint[];
  news: NewsItem[];
  questions: DailyQuestion[];
  answers: Answer[];
  holdings: Holding[];
  trades: Trade[];
  rewards: Reward[];
  redemptions: Redemption[];
  powerupCatalog: Powerup[];
  studentPowerups: StudentPowerup[];
};
