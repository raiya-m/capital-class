import { createSeed } from "./seed";
import { readDbPayload, writeDbPayload } from "./db";
import type { StoreData } from "./types";

const VERSION = 11;

let writing: Promise<void> = Promise.resolve();

function needsReset(data: StoreData) {
  return data.version !== VERSION || !data.sectors?.[0] || !("ticker" in data.sectors[0]);
}

// Deliberately no in-memory cache. Route handlers and server actions can run in
// separate module instances, so a copy held here goes stale the moment the other
// one writes — the coach kept quoting balances from before a student's trade.
// The payload is ~30 KB and parses in well under a millisecond, so every read
// goes to SQLite.
async function load(): Promise<StoreData> {
  const parsed = await readDbPayload();
  if (!parsed || needsReset(parsed)) {
    const fresh = createSeed();
    await writeDbPayload(fresh);
    return fresh;
  }
  return parsed;
}

export async function readStore() {
  return load();
}

export async function updateStore<T>(mutator: (data: StoreData) => T | Promise<T>) {
  const run = writing.then(async () => {
    const data = await load();
    const result = await mutator(data);
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
  const fresh = createSeed();
  await writeDbPayload(fresh);
  return fresh;
}
