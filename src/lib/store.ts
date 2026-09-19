import { createSeed } from "./seed";
import { readDbPayload, writeDbPayload } from "./db";
import type { StoreData } from "./types";

const VERSION = 11;

let cache: StoreData | null = null;
let writing: Promise<void> = Promise.resolve();

function needsReset(data: StoreData) {
  return data.version !== VERSION || !data.sectors?.[0] || !("ticker" in data.sectors[0]);
}

async function load(): Promise<StoreData> {
  if (cache && !needsReset(cache)) return cache;
  const parsed = await readDbPayload();
  if (!parsed || needsReset(parsed)) {
    const fresh = createSeed();
    await writeDbPayload(fresh);
    cache = fresh;
    return cache;
  }
  cache = parsed;
  return cache;
}

export async function readStore() {
  return load();
}

export async function updateStore<T>(mutator: (data: StoreData) => T | Promise<T>) {
  const run = writing.then(async () => {
    const data = await load();
    const result = await mutator(data);
    cache = data;
    await writeDbPayload(data);
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
  await writeDbPayload(cache);
  return cache;
}
