# 参与贡献

谢谢你愿意花时间。这个库的目标不是「组件最多」，而是**查到的每一句都对**。所以下面这些贡献同样重要：

| 你可以做的事 | 门槛 | 入口 |
|---|---|---|
| 指出某条中文释义与 GH2 实际行为不符 | 会用 GH2 就行 | [提 Issue](../../issues/new?template=content-correction.yml) |
| 报告识别台认不出的组件（附代号更佳） | 拖一下电池 | [提 Issue](../../issues/new?template=identify-issue.yml) |
| 补充缺少的精讲、术语、配方 | 会写 Markdown | 直接改 `tools/content/` 后提 PR |
| 修正错别字、断链、移动端排版 | 会用编辑器 | 直接提 PR |

不确定该走哪条路，就来 Q 群 **1104824684** 问一句，或在 Issue 里描述清楚现象，我们会帮你判断。

---

## 一、贡献内容的三条硬规则

1. **以 GH2 的实际行为为准，不以「看起来合理」为准。**
   释义的依据是组件说明原文、端口类型、数据结构标注（单项 / 小枝 / 树）与实机验证。凡是没把握的，宁可留白，也不要写「应该是……」。
2. **术语必须走统一词表。**
   `List` 一律译作「列表」，`Tree` 译作「树」，`Access` 译作「数据结构」，`Item` 译作「项」，`Branch` 译作「分支」。新增术语请同时更新 `tools/content/ports_dict.json`，不要各写一套。
3. **不改写官方英文原文。**
   站内会保留 GH2 的英文说明作为对照。中文是我们的整理，英文是原始依据，两者不互相覆盖。

以下改动通常不会被合入：整库机器翻译且未校对、把「参数对象」当作组件宣传、为凑数量而写的空泛精讲、与 GH2 行为冲突的「经验之谈」。

## 二、改内容：只动 JSON，不碰构建产物

中文内容集中在 `tools/content/`，改完由脚本合成到站点数据，**不要手改 `public/data/`**。

### 1. 组件的中文名与一句话用途

文件：`tools/content/zh/<库名>.zh.json`

```json
{
  "curve.curve-through-points": {
    "cn": "插值曲线",
    "summary": "生成一条穿过所有给定点的平滑曲线。"
  }
}
```

- 键是组件 id（在 `/c/<id>` 或 `public/data/index.json` 里能查到）
- `summary` 控制在一句话，说清「做什么」，不写参数细节

### 2. 端口中文名

文件：`tools/content/ports/<库名>.zh.json`

```json
{
  "maths.addition": {
    "inputs": { "Operand A": { "cn": "操作数 A", "info": "第一个参与相加的值。" } },
    "outputs": { "Result": { "cn": "结果" } }
  }
}
```

端口名是**英文原名**作键，不要翻译后当键。

### 3. 核心组件精讲

文件：`tools/content/detail/core-<批次>.json`

```json
{
  "data.dispatch": {
    "concept": "按布尔值把一列数据分成两路。",
    "steps": ["接一列要分流的数据。", "接一组真/假判断。", "两路输出分别接下游。"],
    "scenes": [{ "title": "按楼层拆分", "body": "……", "wiring": "楼层列表 → Dispatch" }],
    "pitfalls": ["判断列表比数据短时，会按数据结构规则循环补位。"],
    "related": ["data.cull-by-pattern", "data.list-length"],
    "tip": "分流之后记得检查两路总数是否等于原来。"
  }
}
```

- `related` 必须是**真实存在的组件 id**，写错会在构建时报错
- 精讲只写给「高频 + 容易用错」的组件，不必每个都写

### 4. 改完自检

```bash
python tools/build/build_data.py     # 合成数据，会打印覆盖率与体积
npm run dev                          # 打开页面看效果
```

## 三、本地开发

```bash
git clone https://github.com/codeRong9/gh2-cn-reference.git
cd gh2-cn-reference
npm install
npm run dev
```

常用命令：

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务器，默认 <http://localhost:5173> |
| `npm run build` | 产出 `dist/`（含 GitHub Pages 用的 `404.html`） |
| `npm run data` | 重新合成站点数据 |
| `npm run zip` | 打包 `dist-site.zip`，用于 Cloudflare 直传 |

站点只依赖已提交的数据文件，**不需要安装 Rhino**。只有重新提取组件元数据时才需要 Rhino 9 + .NET SDK，步骤见 [README](README.md#重新生成数据)。

## 四、提 PR 的流程

1. Fork 仓库，从 `main` 切一个语义化分支：`fix/curve-offset-cn`、`content/params-glossary`、`feat/identify-guid`
2. 一次 PR 只做一件事，改动范围尽量小，便于逐条核对
3. Commit message 用「范围: 说明」的形式，例如：
   ```
   content: 修正 Offset Curve 的端口释义
   fix: 识别台对 Listen/Shout 的代号匹配
   ```
4. PR 描述里写清三件事：**改了什么、依据是什么、怎么验证的**（截图、组件代号、官方说明原文任选）
5. 涉及释义变更时，请附上你在 GH2 里的验证方式，评审会优先合入有依据的改动

评审关注点只有一条：**改完之后，新手照着做会不会走弯路。**

## 五、行为约定

参与讨论、提 Issue、写 PR 时，请遵守 [行为准则](CODE_OF_CONDUCT.md)：对事不对人，不嘲讽「这么简单都不会」，不索要他人的账号或私密数据。

## 六、许可

提交贡献即表示同意你的文字内容以 MIT 协议随本项目发布；组件名称、英文说明与图标的版权仍归 McNeel 及各组件作者。
