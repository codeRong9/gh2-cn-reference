// 用 Playwright 录制宣传片：加载 master-edit.html，播放 GSAP 时间线并录屏，输出 webm。
// 用法：node tools/build/render_promo.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../outputs/promo-runs/2026-11-15-gh2-cn-reference/", import.meta.url));
const HTML = (ROOT + "master-edit.html").replace(/\\/g, "/");
const OUT = ROOT + "record/";
const DUR = 76;

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
await page.goto("file:///" + HTML);
await page.waitForTimeout(1500);
await page.evaluate(() => window.__timelines.promo.play());

const t0 = Date.now();
const iv = setInterval(() => console.log("elapsed", Math.round((Date.now() - t0) / 1000), "s"), 5000);
await page.waitForTimeout(DUR * 1000);
clearInterval(iv);

await context.close();
await browser.close();
console.log("recorded ->", OUT);
