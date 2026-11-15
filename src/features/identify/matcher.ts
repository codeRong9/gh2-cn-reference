import { loadLib } from "@/lib/dataClient";
import type { ComponentRecord } from "@/lib/types";

export interface MatchResult {
  record: ComponentRecord | null;
  raw: string;
  how: "guid" | "name" | "type" | "guess";
}

export interface NameIndex {
  byName: Map<string, ComponentRecord>;
  byGuid: Map<string, ComponentRecord>;
  names: string[];
}

const LIB_KEYS = ["maths", "data", "vector", "curve", "surface", "mesh", "transform",
  "intersect", "display", "text", "meta", "annotation", "script"];

let indexPromise: Promise<NameIndex> | null = null;

export function buildIndex(): Promise<NameIndex> {
  if (indexPromise) return indexPromise;
  indexPromise = Promise.all(LIB_KEYS.map((lib) => loadLib(lib).catch(() => [] as ComponentRecord[]))).then(
    (libs) => {
      const byName = new Map<string, ComponentRecord>();
      const byGuid = new Map<string, ComponentRecord>();
      for (const records of libs) {
        for (const record of records) {
          byName.set(record.name.toLowerCase(), record);
          if (!byName.has(record.typeName.toLowerCase())) {
            byName.set(record.typeName.toLowerCase(), record);
          }
          if (record.guid) byGuid.set(record.guid.toLowerCase(), record);
        }
      }
      const names = [...byName.keys()].filter((k) => k.length >= 4).sort((a, b) => b.length - a.length);
      return { byName, byGuid, names };
    },
  );
  return indexPromise;
}

export function resetIndex() {
  indexPromise = null;
}

/** 从任意文本里按「连续英文词」滑窗匹配已知组件名。 */
export function scanText(text: string, index: NameIndex, limit = 200): MatchResult[] {
  const tokens = text
    .replace(/[^A-Za-z0-9_\- ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const found = new Map<string, MatchResult>();
  const maxWindow = 5;
  for (let i = 0; i < tokens.length; i += 1) {
    for (let n = 1; n <= maxWindow && i + n <= tokens.length; n += 1) {
      const phrase = tokens.slice(i, i + n).join(" ").toLowerCase();
      const hit = index.byName.get(phrase);
      if (hit && !found.has(hit.id)) {
        found.set(hit.id, {
          record: hit,
          raw: tokens.slice(i, i + n).join(" "),
          how: phrase === hit.name.toLowerCase() ? "name" : "type",
        });
      }
    }
    if (found.size >= limit) break;
  }
  return [...found.values()];
}

export function matchByGuid(guid: string, index: NameIndex): MatchResult | null {
  const hit = index.byGuid.get(guid.toLowerCase());
  return hit ? { record: hit, raw: guid, how: "guid" } : null;
}

export function matchByName(name: string, index: NameIndex): MatchResult | null {
  const clean = name.trim().replace(/\s+/g, " ").toLowerCase();
  const hit = index.byName.get(clean);
  if (hit) return { record: hit, raw: name, how: "name" };
  // GH2 组件名常带 Component 后缀或命名空间前缀
  const stripped = clean.replace(/component$/, "").replace(/^.*\./, "");
  const hit2 = index.byName.get(stripped);
  if (hit2) return { record: hit2, raw: name, how: "guess" };
  const partial = index.names.find((n) => n === stripped) ?? index.names.find((n) => n.startsWith(stripped));
  if (partial) {
    const rec = index.byName.get(partial);
    if (rec) return { record: rec, raw: name, how: "guess" };
  }
  return null;
}
