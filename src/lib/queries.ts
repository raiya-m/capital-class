import { requireProfile } from "./auth";
import { classStats, holdingValue, priceMap } from "./market";
import { readStore } from "./store";
import type { Classroom, Profile, StoreData } from "./types";

export async function classroomFor(profile: Profile) {
  const data = await readStore();
  if (!profile.classroomId) return null;
  return data.classrooms.find((c) => c.id === profile.classroomId) ?? null;
}

function classroomNews(data: StoreData, classroom: Classroom) {
  const items = data.news.filter((n) => n.classroomId === classroom.id);
  const today = items.filter((n) => n.day === classroom.marketDay);
  if (today.length) return today;
  const latest = Math.max(0, ...items.map((n) => n.day));
  return items.filter((n) => n.day === latest);
}

function classroomQuestion(data: StoreData, classroom: Classroom) {
  return (
    data.questions.find((q) => q.classroomId === classroom.id && q.day === classroom.marketDay) ??
    data.questions
      .filter((q) => q.classroomId === classroom.id)
      .sort((a, b) => b.day - a.day)[0]
  );
}

export async function adminContext() {
  const profile = await requireProfile();
  if (profile.role !== "admin") throw new Error("Administrators only");
  const data = await readStore();
  const teachers = data.profiles.filter((p) => p.role === "teacher");
  const students = data.profiles.filter((p) => p.role === "student");
  return { profile, data, teachers, students };
}

export async function teacherContext() {
  const profile = await requireProfile();
  if (profile.role !== "teacher") throw new Error("Teachers only");
  const data = await readStore();
  const classroom = data.classrooms.find((c) => c.id === profile.classroomId);
  if (!classroom) throw new Error("No classroom");
  const stats = classStats(data, classroom.id);
  const pending = data.redemptions.filter((r) => r.classroomId === classroom.id && r.status === "pending");
  const todayGrants = data.tokenLedger.filter((t) => t.classroomId === classroom.id);
  const news = classroomNews(data, classroom);
  const question = classroomQuestion(data, classroom);
  const rewards = data.rewards.filter((r) => r.classroomId === classroom.id);
  return { profile, data, classroom, stats, pending, todayGrants, news, question, rewards };
}

export async function studentContext() {
  const profile = await requireProfile();
  if (profile.role !== "student") throw new Error("Students only");
  const data = await readStore();
  const classroom = data.classrooms.find((c) => c.id === profile.classroomId);
  if (!classroom) throw new Error("No classroom");
  const wallet = data.wallets.find((w) => w.profileId === profile.id);
  if (!wallet) throw new Error("No wallet");
  const stats = classStats(data, classroom.id);
  const rank = stats.students.findIndex((s) => s.student.id === profile.id) + 1;
  const prices = priceMap(data);
  const holdings = data.holdings.filter((h) => h.studentId === profile.id);
  const invested = holdingValue(holdings, prices, profile.id);
  const news = classroomNews(data, classroom);
  const question = classroomQuestion(data, classroom);
  const myAnswer = question
    ? data.answers.find((a) => a.questionId === question.id && a.studentId === profile.id)
    : undefined;
  const rewards = data.rewards.filter((r) => r.classroomId === classroom.id && r.active);
  const redemptions = data.redemptions.filter((r) => r.studentId === profile.id);
  const powerups = data.studentPowerups.filter((p) => p.studentId === profile.id);
  const history = data.prices;
  return {
    profile,
    data,
    classroom,
    wallet,
    stats,
    rank,
    prices,
    holdings,
    invested,
    news,
    question,
    myAnswer,
    rewards,
    redemptions,
    powerups,
    history,
  };
}
