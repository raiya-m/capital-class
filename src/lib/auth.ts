import { cookies } from "next/headers";
import { readStore, updateStore } from "./store";
import { hashPassword, verifyPassword } from "./hash";
import { uid } from "./utils";
import type { Profile, Role } from "./types";

const COOKIE = "cc_session";

export function homeFor(role: Role) {
  if (role === "admin") return "/admin";
  if (role === "teacher") return "/teacher/summary";
  return "/student/portfolio";
}

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

export async function requireRole(...roles: Role[]) {
  const profile = await requireProfile();
  if (!roles.includes(profile.role)) throw new Error("Not allowed for this role");
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

    if (input.role === "admin") {
      return { error: "Administrators are created from the admin console." };
    }

    if (input.role === "teacher") {
      return { error: "Teachers are added by an administrator." };
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
