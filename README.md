# GH2 中文操作库

面向初学者的 Grasshopper 2 中文参考站：**1410 个原生组件全量中文速查 + 核心组件精讲 + 画布识别**。

全站静态，联网即可访问；浅色为默认，一键切深色。

> **在线地址**：<https://coderong9.github.io/gh2-cn-reference/>
> 交流反馈：论坛 Q 群 **1104824684**

## 它解决什么问题

GH2 的界面是英文的，组件的帮助（右上角那个小问号）也是英文的。查一个电池要同时知道四件事：
它做什么、每个端口吃什么类型、该怎么连、什么时候该用它。这个站把四件事放到一页里说完。

## 数据从哪来

不是截图、不是道听途说，而是**从本机安装的 Grasshopper 2（随 Rhino 9 提供）内置程序集里直接读出来的**：

| 项目 | 数量 |
|---|---|
| 原生组件 | 1410 |
| 端口条目 | 5956 |
| 内置库 | 13（数学 / 数据 / 向量 / 曲线 / 曲面 / 网格 / 变换 / 相交 / 显示 / 文本 / 元组件 / 标注 / 脚本） |
| 组件图标 | 1339 个真实矢量图标（`.ghicon` → SVG） |

读取的内容正是 GH2 帮助面板的原文出处：组件名、所属章与节、端口名与端口说明、数据类型标注、端口的数据结构（单项 / 小枝 / 树）。

未收录：GH1 旧组件迁移器（migration 库）；GH2 的「参数」面板（点、圆、滑块、Panel 等属于参数对象，不是组件）。

## 站点结构

```
/                 首页：定位、搜索、四站式学习路径、按库速览
/learn            四站式入门路径（6 课）
/library          全量组件库：分类树 + 拼音检索 + 类型筛选 + 虚拟滚动
/c/:id            组件详情：端口表、连线示意、GH2 中的位置、精讲正文
/identify         识别台：拖入 .ghx / .gh2、粘贴画布、直接拖入
/recipes          常用组合配方（8 条可落地的链路）
/glossary         中英术语表（120+ 条）
/about            数据来源、提取方式、版权声明
```

## 本地运行

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 产出 dist/，含 404.html（GitHub Pages SPA 回退）
npm run preview    # 本地预览构建产物
```

需要 Node 18+。数据已经随仓库提供（`public/data`、`public/icons`），**不装 Rhino 也能跑**。

## 怎么重新生成数据

只有想更新组件数据时才需要本机装有 Rhino 9（GH2）与 .NET SDK、Python 3.10+：

```bash
cd tools/extract/Gh2Decomp && dotnet build -c Release     # 反编译工具
python ../parse_components.py                              # 解析组件与端口
python ../merge.py                                         # 合并 + 挂图标
cd ../icons/Gh2Icons && dotnet build -c Release            # 图标导出工具
cd ../../.. && python tools/build/build_data.py            # 生成站点数据
```

详见 `docs/DATA-PIPELINE.md`。

## 部署

- **GitHub Pages**：推到 `main` 即触发 `.github/workflows/deploy-pages.yml`，自动带上仓库名作为 base 路径。
- **Cloudflare Pages**：构建命令 `npm run build`，输出目录 `dist`，`_redirects` 已处理 SPA 回退。

详见 `docs/DEPLOY.md`。

## 版权与定位

非官方社区学习工具，与 Robert McNeel & Associates 无隶属或背书关系。
组件说明与图标版权归 McNeel 及各组件作者，本站仅用于学习与识别，不用于商业分发。
中文释义、精讲、术语与教程为本项目原创整理。

## 目录

```
src/             React + TS 站点
public/data      分库 JSON、检索索引、统计
public/icons     GH2 组件 SVG 图标
tools/extract    程序集反编译与元数据解析
tools/icons      .ghicon → SVG 导出
tools/content    中文内容单一源（组件释义 / 端口译名 / 精讲）
tools/build      数据合成、体积与覆盖率校验、构建后处理
```
