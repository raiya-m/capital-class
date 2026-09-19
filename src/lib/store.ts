import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { createSeed } from "./seed";
import type { StoreData } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

let cache: StoreData | null = null;
let writing: Promise<void> = Promise.resolve();

async function load(): Promise<StoreData> {
  if (cache) return cache;
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    cache = JSON.parse(raw) as StoreData;
    return cache;
  } catch {
    cache = createSeed();
    await persist(cache);
    return cache;
  }
}

async function persist(data: StoreData) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function readStore() {
  return load();
}

export async function updateStore<T>(mutator: (data: StoreData) => T | Promise<T>) {
  const run = writing.then(async () => {
    const data = await load();
    const result = await mutator(data);
    cache = data;
    await persist(data);
    return result;
  });
  writing = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function resetStore() {
  cache = createSeed();
  await persist(cache);
  return cache;
}
