# GH2 中文操作库

**[中文](README.md) | [English](README.en.md)**

面向中文使用者的 Grasshopper 2 参考站：**1516 个组件与参数对象全量中文速查 + 171 篇核心精讲 + 画布识别台**。

全站静态、联网即用，浅色为默认、一键切深色。

> **在线地址**：<https://coderong9.github.io/gh2-cn-reference/>
> **交流反馈**：论坛 Q 群 **1104824684**（也可直接在本仓库提 Issue）

---

## 这个站解决什么问题

GH2 的界面是英文的，组件右上角那个小问号给出的帮助也是英文的。而看懂一个电池，需要同时知道四件事：

1. 它到底做什么
2. 每个端口吃什么类型的数据
3. 该怎么把它连进一张图
4. 什么时候该用它、什么时候别用

这个站把这四件事放在同一页里说完，并且给出一条**在软件里能找到它**的路径（库 → 章 → 节）。

## 快速开始

**只想查东西**：打开在线地址，按 `Ctrl/⌘ + K` 呼出搜索，输入中文名、英文名、拼音或首字母都行。

**想知道某个电池是什么**：把 GH2 画布另存为 `.ghx` 拖进「识别台」，或者直接把组件拖拽时显示的那串**代号**（形如 `00000000-a9e2-4ef6-a4d8-a8f87f93757f`）粘进去，站内会给出中文解读。

**想本地跑**：

```bash
npm install
npm run dev        # http://localhost:5173
```

需要 Node 18+。数据与图标已随仓库提供（`public/data`、`public/icons`），**不装 Rhino 也能跑起来**。

## 收录范围与数据来源

数据不是截图、不是道听途说，而是**从本机安装的 Grasshopper 2（随 Rhino 9 提供）的程序集里直接读出来的**，读的正是 GH2 帮助面板的原文出处。

| 项目 | 数量 | 说明 |
|---|---|---|
| 原生组件 | 1410 | 13 个组件库 |
| 核心工具组件 | 23 | 簇、Chain、Wait!、读写文件、Graph Mapper 等（GH2 本体提供） |
| 参数对象 | 83 | 参数库：点、数值、滑块、Panel、Listen / Shout 等 |
| 端口条目 | 5956 | 名称、类型、数据结构（单项 / 小枝 / 树）、是否必填 |
| 组件图标 | 1339 | 从 `.ghicon` 资源导出的真实矢量图标 |
| 核心精讲 | 171 | 原理、步骤、场景、易错点、相关组件 |

- **组件代号（IoId）**：每个组件与参数对象都有一个写死的 GUID 作身份，画布文件、剪贴板内容、拖拽文本里都带着它。站内识别优先按代号对表，对不上再退回按名称匹配。
- **未收录**：GH1 旧组件迁移器（migration 库，属于文件兼容用途）；自定义簇、注释框等画布级对象。
- **参数对象的定性**：Listen / Shout / 滑块 / Panel 等在 GH2 里是「参数对象」而不是组件，页面里会明确标注，避免概念混淆。

## 站点结构

```
/                 首页：定位、搜索、四站式学习路径、按库速览
/learn            四站式入门路径（6 课）
/library          全量组件库：分类树 + 拼音检索 + 类型筛选 + 虚拟滚动
/c/:id            组件详情：端口表、连线示意、GH2 中的位置、组件代号、精讲正文
/identify         识别台：拖入 .ghx / .gh2、粘贴画布、粘贴组件代号
/recipes          常用组合配方（8 条可落地的链路）
/glossary         中英术语表（120+ 条）
/about            数据来源、提取方式、在线地址与版权声明
```

## 参与贡献

这个库的价值来自「准确」，而不是「多」。任何让释义更准、让缺口更少的改动都欢迎，包括：

- 指出某条中文释义与 GH2 的实际行为不符
- 补充缺少的精讲、术语或配方
- 报告识别台认不出的组件，并附上它的代号
- 修正错别字、断链、移动端排版问题

具体流程、内容规范与本地命令见 **[CONTRIBUTING.md](CONTRIBUTING.md)**；参与讨论请遵守 **[行为准则](CODE_OF_CONDUCT.md)**。

第一次参与可以从 [`good first issue`](https://github.com/codeRong9/gh2-cn-reference/labels/good%20first%20issue) 标签开始，都是不需要读完整套代码的小任务。

## 重新生成数据

只有在想更新组件数据时，才需要本机装有 Rhino 9（GH2）、.NET SDK 与 Python 3.10+：

```bash
cd tools/extract/Gh2Decomp && dotnet build -c Release     # 反编译工具
python ../parse_components.py                              # 组件库：解析组件与端口
python ../parse_params.py                                  # 参数库：Listen / Shout / 滑块等
python ../merge.py                                         # 合并 + 挂图标
cd ../icons/Gh2Icons && dotnet build -c Release            # 图标导出
cd ../../.. && python tools/build/build_data.py            # 生成站点数据
npm run build                                              # 构建站点
```

原理、字段含义与已知缺口见 [`docs/DATA-PIPELINE.md`](docs/DATA-PIPELINE.md)。

## 部署

- **GitHub Pages**：推到 `main` 即触发 `.github/workflows/deploy-pages.yml`，自动带上仓库名作为 base 路径。
- **Cloudflare Pages**：构建命令 `npm run build`，输出目录 `dist`，`_redirects` 已处理 SPA 回退。

一条命令发布见 `python tools/build/publish_github.py`，细节见 [`docs/DEPLOY.md`](docs/DEPLOY.md)。

## 版权与定位

- 本项目是**非官方**社区学习工具，与 Robert McNeel & Associates 无隶属或背书关系。
- 组件名称、英文说明与图标版权归 McNeel 及各组件作者，本站仅用于学习与识别，**不做商业分发**。
- 中文释义、精讲、术语表、教程与站点代码为本项目原创整理，代码部分以 MIT 协议开放（见 [LICENSE](LICENSE)）。

## 目录结构

```
src/             React + TypeScript 站点
public/data      分库 JSON、检索索引、统计
public/icons     GH2 组件 SVG 图标
tools/extract    程序集反编译与元数据解析（组件库 + 参数库）
tools/icons      .ghicon → SVG 导出
tools/content    中文内容单一源（组件释义 / 端口译名 / 精讲）
tools/build      数据合成、体积校验、构建后处理、发布脚本
docs/            数据管线与部署说明
```

## 致谢

感谢每一位提 Issue、改错字、补释义的人——这个库是靠一条条「这里不对」变准的。
