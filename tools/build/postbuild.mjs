// 构建后处理：为纯静态托管准备 SPA 回退文件。
// GitHub Pages：把 index.html 复制成 404.html（保留路径，路由可正常解析）。
// Cloudflare Pages：public/_redirects 已经处理，这里只做拷贝与自检。
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const indexPath = join(dist, "index.html");

if (!existsSync(indexPath)) {
  console.error("[postbuild] dist/index.html 不存在，构建可能失败");
  process.exit(1);
}

copyFileSync(indexPath, join(dist, "404.html"));

const required = ["data/meta.json", "data/index.json", "data/lib/maths.json"];
const missing = required.filter((f) => !existsSync(join(dist, f)));
if (missing.length) {
  console.error(`[postbuild] 缺少数据文件: ${missing.join(", ")}`);
  process.exit(1);
}

const index = JSON.parse(readFileSync(join(dist, "data/meta.json"), "utf-8"));
console.log(
  `[postbuild] 已生成 404.html · 组件 ${index.componentCount} · 精讲 ${index.detailCount} · 中文 ${index.translatedCount}`,
);
