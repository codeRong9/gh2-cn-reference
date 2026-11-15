# 数据管线

目标：把 Grasshopper 2 程序集里的组件真值，变成站点可直接读取的 JSON 与 SVG。

## 真值来源

```
D:\RHINO\RHINO 9\Plug-ins\Grasshopper2\net8.0\
├─ Grasshopper2.dll            框架（Component / Nomen / InputAdder 等）
├─ Grasshopper2.xml            2352 个类型的 API 文档注释
└─ Components\G2*Components.rhp   13 个组件库（另有 migration 库未收录）
```

## 四步流水线

### 1. 反编译（`tools/extract/Gh2Decomp`）

用 ILSpy 的 `ICSharpCode.Decompiler` 把每个 `.rhp` 反编译成 C# 文本：

```bash
cd tools/extract/Gh2Decomp
dotnet build -c Release
dotnet bin/Release/net10.0/Gh2Decomp.dll module "<路径>\G2MathsComponents.rhp" ../decompiled
```

### 2. 解析（`tools/extract/parse_components.py`）

在反编译文本里定位每个组件的三样东西：

| 目标 | 在代码里的形态 |
|---|---|
| 名称 / 说明 / 章 / 节 | `: base(new Nomen("Addition", "Add two or more values…", "Maths", "Operator", 1, (Rank)173, "op0"))` |
| 端口 | `inputs.AddNumber("Distance", "Ds", "Offset distance.", (Access)0, (Requirement)0)` |
| 图标 | `AbstractIcon.FromResource("Addition", typeof(Maths))` |

注意三个坑（都已在代码里处理）：

1. **同名类**：`Maths.SineFunction` 与 `Maths.Functions.SineFunction` 同在一个程序集，必须以「命名空间.类名」作键；
2. **抽象基类**不是组件，要排除（否则会把 `HyperbolicTrigComponent` 当成一个电池）；
3. **可变端口组件**用 `ModularInputAdder`，端口写在 `inputs.RegularAdder.AddCurve(...)` 里，参数签名是 `ModularInputAdder` 而不是 `InputAdder`。

端口类型由方法名决定（`AddCurve` → Curve、`AddNumber` → Number…），数据结构与必填性来自 `(Access)0/1/2` 与 `(Requirement)0/1/2`：

```
Access:      Item / Twig / Tree
Requirement: MustExist / MayBeNull / MayBeMissing
```

### 3. 图标（`tools/icons/Gh2Icons`）

`.ghicon` 是 GHIO 二进制序列化的矢量图标（不是 SVG、不是 zip）。导出思路：

1. 反射加载 `Grasshopper2.dll`；
2. 把其中所有实现 `IStorable` 的类型注册进 GHIO 类型表 —— **不注册就无法反序列化，`FromStream` 会静默返回 null**；
3. 对每个 `.ghicon` 资源调 `AbstractIcon.FromStream` → `VectorIcon.ToSvgXml()` 写文件。

实测 1494 个资源全部成功导出，0 失败。

### 4. 合成（`tools/build/build_data.py`）

把英文真值与中文内容层合并，产出：

```
public/data/meta.json       统计与分类树
public/data/index.json      轻量检索索引（含拼音全拼与首字母）
public/data/lib/<lib>.json  分库完整数据（含端口）
public/icons/…              被引用到的图标
```

## 中文内容层

```
tools/content/
├─ ports_dict.json     端口名译名单一源（整名优先，其次逐词组合，不认识的词留空）
├─ zh/<lib>.json       每个组件的中文名与一句话用途
├─ detail/<n>.json     核心组件的精讲（原理 / 步骤 / 场景 / 易错 / 相关）
└─ _source/            英文原文清单（翻译时的对照底稿，不参与构建）
```

覆盖情况由 `build_data.py` 输出的 `translated / details` 计数体现；缺失中文时页面降级为英文原文并标注「释义待校」，不会显示占位假解释。

## 校验

- 组件数、端口数、图标匹配率、缺 Nomen / 缺端口的清单：`tools/extract/reports/coverage.json`
- 内容 JSON 语法与 id 关联：构建时读取即为校验，非法 id 不会出现在产物里
