# GH2 Chinese Reference

**English | [中文](README.md)**

A Chinese-language reference site for **Grasshopper 2** (the next-generation Grasshopper shipped with Rhino 9):
full Chinese coverage of every native component, 171 in-depth articles, and a canvas/clipboard identification console.

Live site: <https://coderong9.github.io/gh2-cn-reference/>

> **A note on language.** This project is built for Chinese-speaking users — the UI, terminology and the 171 deep-dive
> articles are all in Chinese, because the pain point we are solving is "the GH2 help panel is English-only".
> The *data layer* is language-agnostic: every component keeps its official English name, official English description,
> port names, port types and its **IoId (GUID)**. If you want to add another language, or you spot a Chinese term that
> conflicts with the official wording, please open an issue — we would rather align with McNeel's terminology than
> invent a parallel one.

## What it covers

| Item | Count | Notes |
|---|---|---|
| Native components | 1410 | the 13 shipped component libraries |
| Core utility components | 23 | Cluster, Chain, Wait!, Read/Write Text File, Graph Mapper, Rhino Pipeline… |
| Parameter objects | 83 | Slider, Panel, Toggle, Listen, Shout, Relay, Tree Viewer… |
| Port records | 6070 | name, type, data structure (item/twig/tree), requirement |
| Vector icons | 1339 | exported from the `.ghicon` resources inside the assemblies |
| Deep-dive articles | 171 | how it works, steps, typical wiring, pitfalls, related components |

**Where the data comes from:** the real `Grasshopper2.dll` / `G2*Components.rhp` assemblies installed on a machine running
Rhino 9 — the same source the component's help popup is generated from. We decompile the IL, read each `Nomen`
(name / chapter / section / description) and each `InputAdder.AddXxx` call, then mirror it in JSON. No screenshots,
no guessing.

Not included on purpose: the GH1 migration library, third-party plugins, and canvas-level objects such as clusters
you create yourself.

## Identifying a component

Every GH2 component and parameter object has a fixed **IoId** — the GUID you see when you drag it:

```
Addition   → 00000000-a9e2-4ef6-a4d8-a8f87f93757f
Shout      → 00000000-0f71-4e41-9379-bbc5c94e3bfb
Listen     → 00000000-0400-48a6-95da-69f309009e06
```

Paste that code into the identify console, drop a `.ghx` / `.gh2` canvas, or paste canvas text — the site resolves the
GUID first and falls back to name matching. The search index exposes the same mapping in `public/data/index.json`
(field `g`), so other tools can reuse it.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Node 18+. All data and icons are committed, so **you do not need Rhino installed** to run the site.
Re-extracting the metadata requires Rhino 9, .NET SDK and Python 3.10+ — see [docs/DATA-PIPELINE.md](docs/DATA-PIPELINE.md).

## Contributing

Contributions are welcome in three shapes:

- **Missing component / plugin translation** — tell us which battery you need (a name or its IoId is enough)
- **Correction** — if a Chinese explanation disagrees with what GH2 actually does, we want to know
- **Another language** — the core stays Chinese, but a terminology review or a localized README/summary set is welcome

Read [CONTRIBUTING.md](CONTRIBUTING.md) (Chinese) for the content rules and PR flow, and please follow the
[Code of Conduct](CODE_OF_CONDUCT.md). Feedback channels: open an issue, or join the forum QQ group **1104824684**.

## License & disclaimer

- Unofficial community project; not affiliated with or endorsed by Robert McNeel & Associates.
- Component names, English descriptions and icons belong to McNeel and the respective authors, and are used here for
  learning and identification only — no commercial redistribution.
- The Chinese explanations, articles, glossary, tutorials and the site source code are original work by this project;
  the code is released under the MIT license (see [LICENSE](LICENSE)).
