import { cookies } from "next/headers";
import { readStore, updateStore } from "./store";
import { hashPassword, verifyPassword } from "./hash";
import { joinCode, uid } from "./utils";
import type { Profile, Role } from "./types";
import { SECTORS } from "./seed";

const COOKIE = "cc_session";

export async function getSessionProfile(): Promise<Profile | null> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (!id) return null;
  const data = await readStore();
  return data.profiles.find((p) => p.id === id) ?? null;
}

export async function requireProfile() {
  const profile = await getSessionProfile();
  if (!profile) throw new Error("Not signed in");
  return profile;
}

async function setSession(profileId: string) {
  const jar = await cookies();
  jar.set(COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function login(email: string, password: string) {
  const data = await readStore();
  const profile = data.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (!profile || !verifyPassword(password, profile.passwordHash)) {
    return { error: "Email or password is not right." };
  }
  await setSession(profile.id);
  return { profile };
}

export async function signup(input: {
  email: string;
  password: string;
  displayName: string;
  role: Role;
  joinCode?: string;
  classroomName?: string;
}) {
  if (!input.email || !input.password || !input.displayName) {
    return { error: "Fill in name, email, and password." };
  }

  return updateStore(async (data) => {
    if (data.profiles.some((p) => p.email.toLowerCase() === input.email.toLowerCase())) {
      return { error: "That email is already in use." };
    }

    if (input.role === "teacher") {
      const teacherId = uid("profile-");
      const classroomId = uid("class-");
      data.classrooms.push({
        id: classroomId,
        teacherId,
        name: input.classroomName?.trim() || `${input.displayName}'s class`,
        joinCode: joinCode(),
        tokenCashRate: 100,
        goalReturnPct: 1.2,
        goalDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
        marketDay: 1,
        baselineClassValue: 0,
        pendingTick: null,
      });
      const profile: Profile = {
        id: teacherId,
        classroomId,
        role: "teacher",
        displayName: input.displayName.trim(),
        email: input.email.trim(),
        passwordHash: hashPassword(input.password),
      };
      data.profiles.push(profile);
      if (data.sectors.length === 0) {
        data.sectors = SECTORS.map((s) => ({ ...s, price: 100 }));
      }
      for (const sector of data.sectors) {
        data.prices.push({ sectorSlug: sector.slug, day: 1, price: sector.price });
      }
      await setSession(profile.id);
      return { profile };
    }

    const code = input.joinCode?.trim().toUpperCase();
    const classroom = data.classrooms.find((c) => c.joinCode === code);
    if (!classroom) return { error: "Join code not found." };

    const profile: Profile = {
      id: uid("profile-"),
      classroomId: classroom.id,
      role: "student",
      displayName: input.displayName.trim(),
      email: input.email.trim(),
      passwordHash: hashPassword(input.password),
    };
    data.profiles.push(profile);
    data.wallets.push({
      profileId: profile.id,
      unspentTokens: 0,
      savingsTokens: 0,
      investmentCash: 0,
      lastSeenMarketDay: classroom.marketDay,
      lastTickSummary: null,
    });
    await setSession(profile.id);
    return { profile };
  });
}
