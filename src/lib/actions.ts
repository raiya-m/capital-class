"use server";

import { login, signup, signOut } from "./auth";
import { applyStudentTick, buildTickSummary, classStats, priceMap } from "./market";
import { generateTick } from "./news";
import { requireProfile } from "./auth";
import { updateStore, resetStore } from "./store";
import type { Role, SectorSlug } from "./types";
import { uid } from "./utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function refresh() {
  revalidatePath("/", "layout");
}

export async function loginAction(formData: FormData) {
  const result = await login(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  if ("error" in result && result.error) return result.error;
  const profile = "profile" in result ? result.profile : null;
  redirect(profile?.role === "teacher" ? "/teacher/summary" : "/student/portfolio");
}

export async function signupAction(formData: FormData) {
  const role = String(formData.get("role") ?? "student") as Role;
  const result = await signup({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
    role,
    joinCode: String(formData.get("joinCode") ?? ""),
    classroomName: String(formData.get("classroomName") ?? ""),
  });
  if ("error" in result && result.error) return result.error;
  const profile = "profile" in result ? result.profile : null;
  redirect(profile?.role === "teacher" ? "/teacher/summary" : "/student/portfolio");
}

export async function signOutAction() {
  await signOut();
  redirect("/login");
}

export async function grantTokens(formData: FormData) {
  const teacher = await requireProfile();
  if (teacher.role !== "teacher" || !teacher.classroomId) return;
  const amount = Number(formData.get("amount"));
  const reason = String(formData.get("reason") ?? "").trim();
  const studentIds = formData.getAll("studentIds").map(String);
  if (!amount || amount < 1 || !reason || studentIds.length === 0) return;

  await updateStore((data) => {
    for (const studentId of studentIds) {
      const wallet = data.wallets.find((w) => w.profileId === studentId);
      if (!wallet) continue;
      wallet.unspentTokens += amount;
      data.tokenLedger.unshift({
        id: uid("led-"),
        classroomId: teacher.classroomId!,
        studentId,
        teacherId: teacher.id,
        amount,
        reason,
        createdAt: new Date().toISOString(),
      });
    }
  });
  refresh();
}

export async function allocateTokens(formData: FormData) {
  const student = await requireProfile();
  const savings = Number(formData.get("savings") ?? 0);
  const invest = Number(formData.get("invest") ?? 0);
  await updateStore((data) => {
    const wallet = data.wallets.find((w) => w.profileId === student.id);
    const classroom = data.classrooms.find((c) => c.id === student.classroomId);
    if (!wallet || !classroom) return;
    if (savings < 0 || invest < 0 || savings + invest === 0) return;
    if (savings + invest > wallet.unspentTokens) return;
    wallet.unspentTokens -= savings + invest;
    wallet.savingsTokens += savings;
    wallet.investmentCash += invest * classroom.tokenCashRate;
  });
  refresh();
}

export async function upsertReward(formData: FormData) {
  const teacher = await requireProfile();
  if (teacher.role !== "teacher" || !teacher.classroomId) return;
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const emoji = String(formData.get("emoji") ?? "🎁").trim() || "🎁";
  const tokenCost = Number(formData.get("tokenCost"));
  if (!title || !tokenCost) return;

  await updateStore((data) => {
    const existing = data.rewards.find((r) => r.id === id);
    if (existing) {
      existing.title = title;
      existing.description = description;
      existing.emoji = emoji;
      existing.tokenCost = tokenCost;
    } else {
      data.rewards.push({
        id: uid("rw-"),
        classroomId: teacher.classroomId!,
        title,
        description,
        emoji,
        tokenCost,
        active: true,
      });
    }
  });
  refresh();
}

export async function toggleReward(rewardId: string) {
  const teacher = await requireProfile();
  await updateStore((data) => {
    const reward = data.rewards.find((r) => r.id === rewardId && r.classroomId === teacher.classroomId);
    if (reward) reward.active = !reward.active;
  });
  refresh();
}

export async function requestReward(rewardId: string) {
  const student = await requireProfile();
  await updateStore((data) => {
    const reward = data.rewards.find((r) => r.id === rewardId && r.active);
    const wallet = data.wallets.find((w) => w.profileId === student.id);
    if (!reward || !wallet || !student.classroomId) return;
    if (wallet.savingsTokens < reward.tokenCost) return;
    wallet.savingsTokens -= reward.tokenCost;
    data.redemptions.unshift({
      id: uid("rd-"),
      classroomId: student.classroomId,
      studentId: student.id,
      rewardId,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  });
  refresh();
}

export async function resolveRedemption(id: string, status: "approved" | "denied") {
  const teacher = await requireProfile();
  await updateStore((data) => {
    const item = data.redemptions.find((r) => r.id === id && r.classroomId === teacher.classroomId);
    if (!item || item.status !== "pending") return;
    item.status = status;
    if (status === "denied") {
      const reward = data.rewards.find((r) => r.id === item.rewardId);
      const wallet = data.wallets.find((w) => w.profileId === item.studentId);
      if (reward && wallet) wallet.savingsTokens += reward.tokenCost;
    }
  });
  refresh();
}

export async function tradeSector(formData: FormData) {
  const student = await requireProfile();
  const slug = String(formData.get("sector")) as SectorSlug;
  const side = String(formData.get("side")) as "buy" | "sell";
  const shares = Number(formData.get("shares"));
  if (!shares || shares <= 0) return;

  await updateStore((data) => {
    const sector = data.sectors.find((s) => s.slug === slug);
    const wallet = data.wallets.find((w) => w.profileId === student.id);
    if (!sector || !wallet) return;
    if (side === "buy") {
      const cost = shares * sector.price;
      if (wallet.investmentCash < cost) return;
      wallet.investmentCash -= cost;
      const holding = data.holdings.find((h) => h.studentId === student.id && h.sectorSlug === slug);
      if (holding) holding.shares += shares;
      else data.holdings.push({ studentId: student.id, sectorSlug: slug, shares });
    } else {
      const holding = data.holdings.find((h) => h.studentId === student.id && h.sectorSlug === slug);
      if (!holding || holding.shares < shares) return;
      holding.shares -= shares;
      wallet.investmentCash += shares * sector.price;
      if (holding.shares === 0) {
        data.holdings = data.holdings.filter((h) => h !== holding);
      }
    }
    data.trades.unshift({
      id: uid("tr-"),
      studentId: student.id,
      sectorSlug: slug,
      side,
      shares,
      price: sector.price,
      createdAt: new Date().toISOString(),
    });
  });
  refresh();
}

export async function buyPowerup(powerupId: string) {
  const student = await requireProfile();
  await updateStore((data) => {
    const item = data.powerupCatalog.find((p) => p.id === powerupId);
    const wallet = data.wallets.find((w) => w.profileId === student.id);
    if (!item || !wallet) return;
    if (wallet.investmentCash < item.costCash) return;
    wallet.investmentCash -= item.costCash;
    const existing = data.studentPowerups.find(
      (p) => p.studentId === student.id && p.powerupId === powerupId,
    );
    if (existing) existing.charges += 1;
    else
      data.studentPowerups.push({
        id: uid("sp-"),
        studentId: student.id,
        powerupId,
        charges: 1,
      });
  });
  refresh();
}

export async function answerQuestion(formData: FormData) {
  const student = await requireProfile();
  const sector = String(formData.get("sector")) as SectorSlug;
  await updateStore((data) => {
    const classroom = data.classrooms.find((c) => c.id === student.classroomId);
    if (!classroom) return;
    const question = data.questions.find((q) => q.classroomId === classroom.id && q.day === classroom.marketDay);
    if (!question) return;
    if (data.answers.some((a) => a.questionId === question.id && a.studentId === student.id)) return;
    const correct = sector === question.correctSector;
    data.answers.push({
      id: uid("ans-"),
      questionId: question.id,
      studentId: student.id,
      sector,
      correct,
      createdAt: new Date().toISOString(),
    });
    if (correct) {
      const wallet = data.wallets.find((w) => w.profileId === student.id);
      if (wallet) wallet.investmentCash += question.rewardCash;
    }
  });
  refresh();
}

export async function previewMarketDay() {
  const teacher = await requireProfile();
  await updateStore(async (data) => {
    const classroom = data.classrooms.find((c) => c.id === teacher.classroomId);
    if (!classroom) return;
    const current = priceMap(data);
    classroom.pendingTick = await generateTick(classroom.marketDay + 1, current);
  });
  refresh();
}

export async function publishMarketDay() {
  const teacher = await requireProfile();
  await updateStore((data) => {
    const classroom = data.classrooms.find((c) => c.id === teacher.classroomId);
    if (!classroom?.pendingTick) return;
    const oldPrices = { ...priceMap(data) };
    const nextDay = classroom.marketDay + 1;
    for (const sector of data.sectors) {
      sector.price = classroom.pendingTick.projectedPrices[sector.slug];
      data.prices.push({ sectorSlug: sector.slug, day: nextDay, price: sector.price });
    }
    for (const item of classroom.pendingTick.news) {
      data.news.push({
        id: uid("news-"),
        classroomId: classroom.id,
        day: nextDay,
        ...item,
      });
    }
    data.questions.push({
      id: uid("q-"),
      classroomId: classroom.id,
      day: nextDay,
      ...classroom.pendingTick.question,
    });
    classroom.marketDay = nextDay;

    const after = classStats(data, classroom.id);
    for (const row of after.students) {
      const { delta, notes } = applyStudentTick(data, row.student.id, oldPrices, priceMap(data));
      const ranked = classStats(data, classroom.id);
      const rank = ranked.students.findIndex((s) => s.student.id === row.student.id) + 1;
      row.wallet.lastTickSummary = buildTickSummary(
        rank,
        ranked.students.length,
        nextDay,
        delta,
        notes,
        null,
      );
    }
    classroom.pendingTick = null;
  });
  refresh();
}

export async function ackEndOfDay() {
  const student = await requireProfile();
  await updateStore((data) => {
    const classroom = data.classrooms.find((c) => c.id === student.classroomId);
    const wallet = data.wallets.find((w) => w.profileId === student.id);
    if (!classroom || !wallet) return;
    wallet.lastSeenMarketDay = classroom.marketDay;
  });
  refresh();
}

export async function resetDemoAction() {
  await resetStore();
  refresh();
  redirect("/login");
}
