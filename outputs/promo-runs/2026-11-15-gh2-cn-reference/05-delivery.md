# 05 · Delivery — 交付与缺口

## 已交付
| 文件 | 说明 |
|---|---|
| `01-brief.md` | 定位、卖点、风格、时长 |
| `02-storyboard.md` | 9 镜 + 4 转场，75s |
| `03-asset-plan.md` | 真实截图捕获清单 + 来源记录 |
| `04-edl.md` | 编辑决策表 |
| `master-edit.html` | HyperFrames 主合成（纯 CSS/GSAP，已可独立预览） |
| `06-music-plan.md` | 两个差异化 BGM 方向 + prompt |

`master-edit.html` 目前**不依赖外部截图**（产品镜头用 CSS 卡片模拟真实 UI，识别台用真实代号），
因此装好渲染器就能直接出片；截图到手后按 `03-asset-plan` 把对应镜头换成 `pack-b/*.png` 即可升级为真实界面。

## 缺口（需要装依赖，本机当前缺失）
1. **ffmpeg** —— 无（`Get-Command ffmpeg` 空）
2. **Chrome / Edge** —— 未在常见路径找到（HyperFrames 渲染需要）

## 渲染命令（补齐依赖后）
```bash
cd outputs/promo-runs/2026-11-15-gh2-cn-reference
npx hyperframes preview               # 浏览器预览
npx hyperframes render --quality high --output final/promo.mp4
# 有 BGM 时：
ffmpeg -i final/promo.mp4 -i assets/bgm/bgm.mp3 -shortest -map 0:v -map 1:a -c:v copy final/promo-with-bgm.mp4
```

## 截图命令（任务 2，同样缺浏览器）
用 Playwright 捕获真实界面到 `docs/screenshots/`：
```bash
npm i -D playwright
npx playwright install chromium
# 执行 tools/build/capture_screenshots.mjs（见仓库）
```

## 修改方式
- 改文案/节奏：直接改 `master-edit.html` 里的 `tl.xxx(...)` 时间码与文本
- 换真实截图：替换 shot 4/5/6/7 的 CSS 卡为 `<img src="assets/pack-b/b-0X.png">`
- 换 BGM：替换 `assets/bgm/bgm.mp3`
