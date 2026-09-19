"use server";

import { login, signup, signOut, requireRole, homeFor } from "./auth";
import { applyStudentTick, buildTickSummary, classStats, priceMap } from "./market";
import { applyIntradayNoise, generateTick, incidentFromTeacher } from "./news";
import { previousClose } from "./trends";
import { requireProfile } from "./auth";
import { updateStore, resetStore } from "./store";
import type { Role, SectorSlug } from "./types";
import { joinCode, uid } from "./utils";
import { hashPassword } from "./hash";
import { SECTORS } from "./seed";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function refresh() {
  revalidatePath("/", "layout");
}

export async function loginAction(formData: FormData) {
  const result = await login(String(formData.get("email") ?? ""), String(formData.get("password") ?? ""));
  if ("error" in result && result.error) return result.error;
  const profile = "profile" in result ? result.profile : null;
  if (!profile) return "Could not sign in.";
  redirect(homeFor(profile.role));
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
  if (!profile) return "Could not create the account.";
  redirect(homeFor(profile.role));
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
  const destination = String(formData.get("destination") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  let savings = Number(formData.get("savings") ?? 0);
  let invest = Number(formData.get("invest") ?? 0);
  if (destination === "savings" && amount > 0) savings = amount;
  if (destination === "invest" && amount > 0) invest = amount;
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
  const emoji = String(formData.get("emoji") ?? "").trim();
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

export async function analyzeTeacherIncident(formData: FormData) {
  const teacher = await requireProfile();
  if (teacher.role !== "teacher") return;
  const incident = String(formData.get("incident") ?? "").trim();
  if (incident.length < 8) return;
  await updateStore(async (data) => {
    const classroom = data.classrooms.find((c) => c.id === teacher.classroomId);
    if (!classroom) return;
    classroom.pendingTick = await incidentFromTeacher(incident, priceMap(data));
  });
  refresh();
}

export async function publishTeacherIncident(formData: FormData) {
  await analyzeTeacherIncident(formData);
  await publishMarketDay();
}

export async function publishMarketDay() {
  const teacher = await requireProfile();
  await updateStore((data) => {
    const classroom = data.classrooms.find((c) => c.id === teacher.classroomId);
    if (!classroom?.pendingTick) return;
    const oldPrices = { ...priceMap(data) };
    const nextDay = classroom.marketDay + 1;
    for (const sector of data.sectors) {
      const next = classroom.pendingTick.projectedPrices[sector.slug];
      if (typeof next === "number") sector.price = next;
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
    classroom.intradayStep = 0;

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

export async function playNewsIncident() {
  await previewMarketDay();
  await publishMarketDay();
}

export async function tickMarket() {
  const quotes = await updateStore((data) => {
    const closes = Object.fromEntries(
      data.sectors.map((s) => [s.slug, previousClose(data.prices, s.slug, s.price)]),
    );
    applyIntradayNoise(data);
    return data.sectors.map((s) => ({
      slug: s.slug,
      ticker: s.ticker,
      name: s.name,
      price: s.price,
      color: s.color,
      prevClose: closes[s.slug] ?? s.price,
    }));
  });
  return quotes;
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

export async function updateAccount(formData: FormData) {
  const profile = await requireProfile();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!displayName || !email) return "Name and email are required.";

  const error = await updateStore((data) => {
    if (data.profiles.some((p) => p.id !== profile.id && p.email.toLowerCase() === email)) {
      return "That email is already in use.";
    }
    const row = data.profiles.find((p) => p.id === profile.id);
    if (!row) return "Account not found.";
    row.displayName = displayName;
    row.email = email;
    if (password) row.passwordHash = hashPassword(password);
    return null;
  });
  if (error) return error;
  refresh();
}

export async function createTeacher(formData: FormData) {
  await requireRole("admin");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const classroomName = String(formData.get("classroomName") ?? "").trim();
  if (!displayName || !email || !password) return "Name, email, and password are required.";

  const error = await updateStore((data) => {
    if (data.profiles.some((p) => p.email.toLowerCase() === email)) return "That email is already in use.";
    const teacherId = uid("profile-");
    const classroomId = uid("class-");
    data.classrooms.push({
      id: classroomId,
      teacherId,
      name: classroomName || `${displayName}'s class`,
      joinCode: joinCode(),
      tokenCashRate: 100,
      goalReturnPct: 1.2,
      goalDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      marketDay: 1,
      baselineClassValue: 0,
      pendingTick: null,
      lastIntradayAt: 0,
      intradayStep: 0,
    });
    data.profiles.push({
      id: teacherId,
      classroomId,
      role: "teacher",
      displayName,
      email,
      passwordHash: hashPassword(password),
    });
    if (data.sectors.length === 0) {
      data.sectors = SECTORS.map((s) => ({ ...s, price: 100 }));
    }
    return null;
  });
  if (error) return error;
  refresh();
}

export async function removeTeacher(formData: FormData) {
  await requireRole("admin");
  const teacherId = String(formData.get("teacherId") ?? "");
  if (!teacherId) return;
  await updateStore((data) => {
    const teacher = data.profiles.find((p) => p.id === teacherId && p.role === "teacher");
    if (!teacher) return;
    const classroomId = teacher.classroomId;
    const studentIds = data.profiles.filter((p) => p.classroomId === classroomId && p.role === "student").map((p) => p.id);
    data.profiles = data.profiles.filter((p) => p.id !== teacherId && !studentIds.includes(p.id));
    data.wallets = data.wallets.filter((w) => !studentIds.includes(w.profileId));
    data.holdings = data.holdings.filter((h) => !studentIds.includes(h.studentId));
    data.trades = data.trades.filter((t) => !studentIds.includes(t.studentId));
    data.classrooms = data.classrooms.filter((c) => c.id !== classroomId);
    data.news = data.news.filter((n) => n.classroomId !== classroomId);
    data.questions = data.questions.filter((q) => q.classroomId !== classroomId);
    data.rewards = data.rewards.filter((r) => r.classroomId !== classroomId);
    data.redemptions = data.redemptions.filter((r) => r.classroomId !== classroomId);
  });
  refresh();
}

export async function createStudent(formData: FormData) {
  const teacher = await requireRole("teacher");
  if (!teacher.classroomId) return "No classroom assigned.";
  const displayName = String(formData.get("displayName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!displayName || !email || !password) return "Name, email, and password are required.";

  const error = await updateStore((data) => {
    if (data.profiles.some((p) => p.email.toLowerCase() === email)) return "That email is already in use.";
    const classroom = data.classrooms.find((c) => c.id === teacher.classroomId);
    if (!classroom) return "Classroom not found.";
    const profileId = uid("profile-");
    data.profiles.push({
      id: profileId,
      classroomId: classroom.id,
      role: "student",
      displayName,
      email,
      passwordHash: hashPassword(password),
    });
    data.wallets.push({
      profileId,
      unspentTokens: 0,
      savingsTokens: 0,
      investmentCash: 0,
      lastSeenMarketDay: classroom.marketDay,
      lastTickSummary: null,
    });
    return null;
  });
  if (error) return error;
  refresh();
}

export async function removeStudent(formData: FormData) {
  const teacher = await requireRole("teacher");
  const studentId = String(formData.get("studentId") ?? "");
  if (!studentId || !teacher.classroomId) return;
  await updateStore((data) => {
    const student = data.profiles.find(
      (p) => p.id === studentId && p.role === "student" && p.classroomId === teacher.classroomId,
    );
    if (!student) return;
    data.profiles = data.profiles.filter((p) => p.id !== studentId);
    data.wallets = data.wallets.filter((w) => w.profileId !== studentId);
    data.holdings = data.holdings.filter((h) => h.studentId !== studentId);
    data.trades = data.trades.filter((t) => t.studentId !== studentId);
    data.answers = data.answers.filter((a) => a.studentId !== studentId);
    data.redemptions = data.redemptions.filter((r) => r.studentId !== studentId);
    data.studentPowerups = data.studentPowerups.filter((p) => p.studentId !== studentId);
  });
  refresh();
}
