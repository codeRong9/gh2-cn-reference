import type { ComponentRecord, IndexItem, LibPayload, Meta } from "./types";

const BASE = import.meta.env.BASE_URL || "/";
const url = (p: string) => `${BASE.replace(/\/$/, "")}${p}`;

const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

async function getJson<T>(path: string): Promise<T> {
  if (cache.has(path)) return cache.get(path) as T;
  if (inflight.has(path)) return inflight.get(path) as Promise<T>;
  const task = fetch(url(path))
    .then((res) => {
      if (!res.ok) throw new Error(`${res.status} ${path}`);
      return res.json() as Promise<T>;
    })
    .then((data) => {
      cache.set(path, data);
      inflight.delete(path);
      return data;
    })
    .catch((err) => {
      inflight.delete(path);
      console.error("[data]", err);
      throw err;
    });
  inflight.set(path, task);
  return task;
}

export const loadMeta = () => getJson<Meta>("/data/meta.json");
export const loadIndex = () => getJson<IndexItem[]>("/data/index.json");

export async function loadLib(lib: string): Promise<ComponentRecord[]> {
  const payload = await getJson<LibPayload>(`/data/lib/${lib}.json`);
  return payload.components;
}

export function prefetchLib(lib: string) {
  if (cache.has(`/data/lib/${lib}.json`)) return;
  void loadLib(lib).catch(() => undefined);
}

const recordCache = new Map<string, ComponentRecord>();

export async function loadComponent(id: string): Promise<ComponentRecord | null> {
  if (recordCache.has(id)) return recordCache.get(id)!;
  const lib = id.split(".")[0];
  const list = await loadLib(lib);
  for (const item of list) {
    recordCache.set(item.id, item);
  }
  return recordCache.get(id) ?? null;
}

export async function searchLibrary(term: string, limit = 8): Promise<IndexItem[]> {
  const index = await loadIndex();
  const q = term.trim().toLowerCase();
  if (!q) return [];
  const hits = index.filter(
    (it) =>
      it.n.toLowerCase().includes(q) ||
      it.c.includes(term.trim()) ||
      it.se.toLowerCase().includes(q),
  );
  return hits.slice(0, limit);
}

export function clearRecordCache(id?: string) {
  if (id) recordCache.delete(id);
  else recordCache.clear();
}
