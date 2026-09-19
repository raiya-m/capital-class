import { createHash } from "crypto";

export function hashPassword(password: string) {
  return createHash("sha256").update(`capital-class:${password}`).digest("hex");
}

export function verifyPassword(password: string, hash: string) {
  return hashPassword(password) === hash;
}
