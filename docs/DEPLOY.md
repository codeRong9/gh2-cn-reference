# 部署说明

站点是纯静态产物（`dist/`），两个平台共用同一份构建结果。

## 一、GitHub Pages

### 0. 一条命令发布（推荐）

```bash
python tools/build/publish_github.py            # 默认仓库名 gh2-cn-reference
python tools/build/publish_github.py --repo 自定义名字
python tools/build/publish_github.py --dry-run  # 只校验令牌
```

脚本会依次完成：校验令牌 → 建仓（已存在则复用）→ 本地初始化并提交 → 推送 → 开启 Pages（Actions 构建）。
令牌自动读取优先级：`--token` 参数 > 环境变量 `GITHUB_TOKEN` > IDE 的 `~/.codebuddy/mcp.json` 中 GitHub MCP 的 PAT。
令牌需要 `repo` 与 `workflow` 权限；令牌只用于单次推送的请求头，不会写进 `.git/config`。

### 1. 手动建仓并推送

```bash
git init
git add .
git commit -m "feat: GH2 中文操作库"
git branch -M main
git remote add origin https://github.com/<你的账号>/<仓库名>.git
git push -u origin main
```

### 2. 开启 Pages

仓库 → **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。

推送后工作流 `.github/workflows/deploy-pages.yml` 会自动执行：

- `VITE_BASE=/<仓库名>/`（子路径部署必须带仓库名，否则静态资源 404）
- `npm ci` → `npm run build` → 上传 `dist` → 发布

访问地址：`https://<账号>.github.io/<仓库名>/`

### 3. 自定义域名（可选）

`Pages` 里填自定义域名后，把 `VITE_BASE` 改成 `/`（根路径部署），或继续用子路径。

### 4. 刷新后 404 怎么办

构建时会自动把 `index.html` 复制为 `404.html`。GitHub Pages 在找不到路径时返回 `404.html`，
浏览器加载的仍是同一个 SPA，路由会按当前路径正常渲染。

## 二、Cloudflare Pages

### 方式 A：连 Git（推荐）

1. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**
2. 选择仓库，构建配置：

| 项 | 值 |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 20（环境变量 `NODE_VERSION=20`） |

根路径部署，不需要设置 `VITE_BASE`。

### 方式 B：直接上传产物（无需 Git，最快出地址）

```bash
npm run build   # 产出 dist/
npm run zip     # 打包为 dist-site.zip（根目录即站点根，约 1.5MB）
```

上传步骤：

1. 打开 <https://dash.cloudflare.com> → 左侧 **Workers & Pages**
2. **Create → Pages → Upload assets**
3. 项目名填 `gh2-cn-reference`（可自定，决定最终域名）
4. 把 `dist-site.zip` 直接拖进去（也可拖整个 `dist/` 目录）→ **Deploy site**
5. 拿到地址：`https://<项目名>.pages.dev`

说明：`_redirects`、`_headers`、`404.html` 都已在包里，SPA 路由回退与缓存策略自动生效；后续内容更新重复第 4 步即可覆盖发布。

### 已配置的规则

- `public/_redirects`：`/* /index.html 200`，SPA 路由回退
- `public/_headers`：图标与 assets 长缓存、数据文件短缓存、`nosniff` 与 referrer 策略

## 三、其他静态托管

任何静态服务器都可以，注意两点：

1. **SPA 回退**：所有未命中的路径返回 `index.html`
2. **base 路径**：部署在子目录时构建前设置 `VITE_BASE=/子目录/`

## 四、构建体积参考

| 产物 | 原始 | gzip |
|---|---|---|
| 首屏 JS（含路由与搜索） | ~44 KB | ~16 KB |
| vendor（React + Router） | ~164 KB | ~54 KB |
| 检索索引 `data/index.json` | ~372 KB | ~90 KB |
| 单库数据 `data/lib/*.json` | 100–300 KB | 按需加载 |
| 图标 | 1339 个 SVG，按需加载 | — |
