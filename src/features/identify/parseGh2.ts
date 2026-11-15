import { matchByGuid, scanText, type MatchResult, type NameIndex } from "./matcher";

const GUID_RE = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g;

/**
 * GH2 的 .gh2 是 GHIO 二进制归档，浏览器里没有官方解码器。
 * 可行做法：在二进制里同时按 UTF-8 与 UTF-16LE 解码，捞出 GUID 与已知组件名，
 * 用「认识的名字」反推画布用了哪些组件——够用来做翻译，不足以还原真个图结构。
 */
export function parseBinary(buffer: ArrayBuffer, index: NameIndex): MatchResult[] {
  const bytes = new Uint8Array(buffer);
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const utf16 = new TextDecoder("utf-16le", { fatal: false }).decode(bytes);

  const found = new Map<string, MatchResult>();

  for (const raw of `${utf8}\n${utf16}`.match(GUID_RE) ?? []) {
    const hit = matchByGuid(raw, index);
    if (hit?.record && !found.has(hit.record.id)) found.set(hit.record.id, hit);
  }

  for (const text of [utf8, utf16]) {
    for (const hit of scanText(text, index)) {
      if (hit.record && !found.has(hit.record.id)) found.set(hit.record.id, hit);
    }
  }

  return [...found.values()];
}

export function isProbablyBinary(buffer: ArrayBuffer): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 512));
  let nonPrintable = 0;
  for (const b of bytes) {
    if (b === 0) return true;
    if (b < 9 || (b > 13 && b < 32)) nonPrintable += 1;
  }
  return nonPrintable > bytes.length * 0.1;
}
