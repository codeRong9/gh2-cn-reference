import type { IndexItem } from "@/lib/types";

/**
 * 检索打分：中文名 / 英文名 / 拼音 / 拼音首字母 / 章节。
 * 拼音在构建期算好写进索引（py / pyi），运行时零依赖。
 */
export function scoreItem(item: IndexItem, rawTerm: string): number {
  const term = rawTerm.trim().toLowerCase();
  if (!term) return 0;

  const name = item.n.toLowerCase();
  const cn = item.c.toLowerCase();
  const section = (item.seC + item.se).toLowerCase();
  let score = 0;

  if (name === term || cn === term) score = 120;
  else if (name.startsWith(term) || cn.startsWith(term)) score = 95;
  else if (name.includes(term) || cn.includes(term)) score = 70;
  else if (section.includes(term)) score = 34;

  const full = item.py ?? "";
  const initials = item.pyi ?? "";
  if (!score && full.startsWith(term)) score = 62;
  if (!score && initials.startsWith(term)) score = 56;
  if (!score && term.length > 1 && initials === term) score = 66;
  if (!score && full.includes(term)) score = 40;

  if (score && item.d) score += 8;
  return score;
}

export function resetScoreCache() {
  /* 拼音已在索引里，无需缓存 */
}
