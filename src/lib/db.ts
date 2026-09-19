import { createClient, type Client } from "@libsql/client";
import { mkdir } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import type { StoreData } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "capital-class.db");

let client: Client | null = null;
let ready: Promise<Client> | null = null;

async function connect() {
  if (client) return client;
  await mkdir(DATA_DIR, { recursive: true });
  client = createClient({ url: pathToFileURL(DB_PATH).href });
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      classroom_id TEXT,
      role TEXT NOT NULL,
      display_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS classrooms (
      id TEXT PRIMARY KEY,
      teacher_id TEXT,
      name TEXT NOT NULL,
      join_code TEXT NOT NULL
    );
  `);
  return client;
}

export function dbReady() {
  if (!ready) ready = connect();
  return ready;
}

export function dbFilePath() {
  return DB_PATH;
}

export async function readDbPayload(): Promise<StoreData | null> {
  const db = await dbReady();
  const row = await db.execute("SELECT payload FROM app_state WHERE id = 1");
  const payload = row.rows[0]?.payload;
  if (typeof payload !== "string") return null;
  try {
    return JSON.parse(payload) as StoreData;
  } catch {
    return null;
  }
}

export async function writeDbPayload(data: StoreData) {
  const db = await dbReady();
  const now = new Date().toISOString();
  const statements = [
    {
      sql: `INSERT INTO app_state (id, version, payload, updated_at)
            VALUES (1, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET version = excluded.version, payload = excluded.payload, updated_at = excluded.updated_at`,
      args: [data.version, JSON.stringify(data), now],
    },
    { sql: "DELETE FROM accounts", args: [] },
    { sql: "DELETE FROM classrooms", args: [] },
    ...data.profiles.map((p) => ({
      sql: "INSERT INTO accounts (id, classroom_id, role, display_name, email) VALUES (?, ?, ?, ?, ?)",
      args: [p.id, p.classroomId, p.role, p.displayName, p.email],
    })),
    ...data.classrooms.map((c) => ({
      sql: "INSERT INTO classrooms (id, teacher_id, name, join_code) VALUES (?, ?, ?, ?)",
      args: [c.id, c.teacherId, c.name, c.joinCode],
    })),
  ];
  await db.batch(statements, "write");
}

export async function dbStats() {
  const db = await dbReady();
  const accounts = await db.execute("SELECT COUNT(*) AS n FROM accounts");
  const classes = await db.execute("SELECT COUNT(*) AS n FROM classrooms");
  const state = await db.execute("SELECT version, updated_at FROM app_state WHERE id = 1");
  return {
    backend: "sqlite" as const,
    file: DB_PATH,
    accounts: Number(accounts.rows[0]?.n ?? 0),
    classrooms: Number(classes.rows[0]?.n ?? 0),
    version: Number(state.rows[0]?.version ?? 0),
    updatedAt: String(state.rows[0]?.updated_at ?? ""),
  };
}
