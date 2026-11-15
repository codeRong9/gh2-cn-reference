import { matchByName, matchByGuid, type MatchResult, type NameIndex } from "./matcher";

/**
 * GH1 的 .ghx 是 XML 文本：每个组件对象里带 Name / NickName / ComponentGuid。
 * GH2 能读 .ghx，所以拖进来的多半还是这种结构。
 */
export interface ParsedCanvas {
  objects: MatchResult[];
  unknown: string[];
  total: number;
}

function decode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder("utf-16le").decode(bytes);
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder("utf-16be").decode(bytes);
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export function looksLikeGhx(text: string): boolean {
  return /<Archive|<Definition|<Document/i.test(text.slice(0, 4000));
}

export function parseGhx(buffer: ArrayBuffer, index: NameIndex): ParsedCanvas {
  const text = decode(buffer);
  return parseGhxText(text, index);
}

export function parseGhxText(text: string, index: NameIndex): ParsedCanvas {
  const objects: MatchResult[] = [];
  const unknown: string[] = [];
  const seen = new Set<string>();

  // 组件对象块：<object name="..." ...> ... </object>
  const objectBlocks = text.match(/<object\b[\s\S]*?<\/object>/g) ?? [];
  for (const block of objectBlocks) {
    const name =
      /<item name="Name"[^>]*>([^<]*)<\/item>/.exec(block)?.[1]?.trim() ??
      /<item name="NickName"[^>]*>([^<]*)<\/item>/.exec(block)?.[1]?.trim();
    const guid = /<item name="ComponentGuid"[^>]*>([^<]*)<\/item>/.exec(block)?.[1]?.trim();
    if (!name && !guid) continue;

    let hit = guid ? matchByGuid(guid, index) : null;
    if (!hit && name) hit = matchByName(name, index);
    if (hit?.record) {
      if (!seen.has(hit.record.id)) {
        seen.add(hit.record.id);
        objects.push(hit);
      }
    } else if (name && /^[A-Za-z]/.test(name) && name.length > 2) {
      if (!unknown.includes(name)) unknown.push(name);
    }
  }

  const total = objectBlocks.length;
  return { objects, unknown: unknown.slice(0, 40), total };
}
