// 捕获线上站点截图到 docs/screenshots/（供 README 与宣传片使用）
// 用法：
//   npm i -D playwright
//   npx playwright install chromium
//   node tools/build/capture_screenshots.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const BASE = "https://coderong9.github.io/gh2-cn-reference/";
const OUT = fileURLToPath(new URL("../../docs/screenshots/", import.meta.url));

const shots = [
  { name: "home.png", path: "/", full: true },
  { name: "detail.png", path: "/c/data.dispatch" },
  { name: "search.png", path: "/library?q=%E5%8A%A0%E6%B3%95" },
  { name: "identify.png", path: "/identify" },
  { name: "learn.png", path: "/learn" },
  { name: "glossary.png", path: "/glossary" },
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const s of shots) {
  await page.goto(BASE + s.path.replace(/^\//, ""), { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/${s.name}`, fullPage: !!s.full });
  console.log("captured", s.name);
}

await browser.close();
console.log("done ->", OUT);
