import type { Holding, SectorSlug, StoreData, TickSummary, Wallet } from "./types";

export function holdingValue(holdings: Holding[], prices: Record<string, number>, studentId: string) {
  return holdings
    .filter((h) => h.studentId === studentId)
    .reduce((sum, h) => sum + h.shares * (prices[h.sectorSlug] ?? 0), 0);
}

export function priceMap(data: StoreData) {
  return Object.fromEntries(data.sectors.map((s) => [s.slug, s.price])) as Record<SectorSlug, number>;
}

export function portfolioValue(wallet: Wallet, holdings: Holding[], prices: Record<string, number>, studentId: string) {
  return wallet.investmentCash + holdingValue(holdings, prices, studentId);
}

export function classStats(data: StoreData, classroomId: string) {
  const students = data.profiles.filter((p) => p.classroomId === classroomId && p.role === "student");
  const prices = priceMap(data);
  const rows = students.map((s) => {
    const wallet = data.wallets.find((w) => w.profileId === s.id) ?? {
      profileId: s.id,
      unspentTokens: 0,
      savingsTokens: 0,
      investmentCash: 0,
      lastSeenMarketDay: 0,
      lastTickSummary: null,
    };
    const value = portfolioValue(wallet, data.holdings, prices, s.id);
    return { student: s, wallet, value };
  });
  rows.sort((a, b) => b.value - a.value);
  const classValue = rows.reduce((sum, r) => sum + r.value, 0);
  return { students: rows, classValue, prices };
}

export function applyStudentTick(
  data: StoreData,
  studentId: string,
  oldPrices: Record<string, number>,
  newPrices: Record<string, number>,
): { delta: number; notes: string[] } {
  const notes: string[] = [];
  let delta = 0;
  const holdings = data.holdings.filter((h) => h.studentId === studentId);
  for (const h of holdings) {
    delta += h.shares * ((newPrices[h.sectorSlug] ?? 0) - (oldPrices[h.sectorSlug] ?? 0));
  }

  const actives = data.studentPowerups.filter((p) => p.studentId === studentId && p.charges > 0);
  const catalog = data.powerupCatalog;
  let cashAdjust = 0;

  for (const owned of actives) {
    const def = catalog.find((c) => c.id === owned.powerupId);
    if (!def) continue;
    if (def.kind === "double_gain" && delta > 0) {
      cashAdjust += delta;
      notes.push("Lucky Lightning doubled your profits.");
      owned.charges -= 1;
    }
    if (def.kind === "half_loss" && delta < 0) {
      cashAdjust += Math.abs(delta) / 2;
      notes.push("Safety Net cut your losses in half.");
      owned.charges -= 1;
    }
  }

  data.studentPowerups = data.studentPowerups.filter((p) => p.charges > 0);
  const wallet = data.wallets.find((w) => w.profileId === studentId);
  if (wallet) wallet.investmentCash += cashAdjust;
  return { delta: delta + cashAdjust, notes };
}

export function buildTickSummary(
  rank: number,
  classmateCount: number,
  day: number,
  delta: number,
  notes: string[],
  qotdCorrect: boolean | null,
): TickSummary {
  return { day, portfolioDelta: delta, powerupNotes: notes, qotdCorrect, rank, classmateCount };
}
