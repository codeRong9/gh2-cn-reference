import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Boxes, Layers, ScanLine, Sparkles } from "lucide-react";
import { loadIndex, loadMeta } from "@/lib/dataClient";
import type { IndexItem, Meta } from "@/lib/types";
import { QuickSearchBox } from "@/components/search/QuickSearchBox";
import { HeroPreview } from "@/components/home/HeroPreview";
import { ComponentIcon } from "@/components/library/ComponentIcon";
import { PortChip } from "@/components/common/PortChip";
import { cn } from "@/lib/utils";

const STATIONS = [
  {
    no: "01",
    slug: "basics",
    title: "认识界面与端口",
    desc: "画布、电池、端口、连线的第一印象：先知道每个方块在说什么。",
    tag: "10 分钟",
  },
  {
    no: "02",
    slug: "data-structure",
    title: "数据类型与树",
    desc: "Item / List / Tree 三种数据形态，是读懂 GH2 之后一切行为的地基。",
    tag: "20 分钟",
  },
  {
    no: "03",
    slug: "common-components",
    title: "常用组件精讲",
    desc: "数学、列表、点线面：把最高频的一批组件逐个拆开看。",
    tag: "60 分钟",
  },
  {
    no: "04",
    slug: "combine",
    title: "组合与实战",
    desc: "把组件串成流程：分流、排序、阵列、放样，做出第一组可用结果。",
    tag: "边做边学",
  },
];

const FEATURED = [
  "maths.addition",
  "data.dispatch",
  "transform.move",
  "curve.divide-by-count",
  "surface.loft-from-curves",
  "data.sort",
];

export default function Home() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [featured, setFeatured] = useState<IndexItem[]>([]);

  useEffect(() => {
    loadMeta().then(setMeta).catch((err) => console.error(err));
    loadIndex()
      .then((index) => {
        const byId = new Map(index.map((i) => [i.id, i]));
        setFeatured(FEATURED.map((id) => byId.get(id)).filter(Boolean) as IndexItem[]);
      })
      .catch((err) => console.error(err));
  }, []);

  const stats = [
    { label: "组件与参数", value: meta?.componentCount ?? "—" },
    { label: "内置库", value: meta?.libCount ?? "—" },
    { label: "端口条目", value: meta?.portCount ?? "—" },
    { label: "章节", value: meta ? meta.libs.reduce((s, l) => s + Object.keys(l.sections).length, 0) : "—" },
  ];

  return (
    <div>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 blueprint opacity-70" />
        <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1320px] gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-surface/80 px-3 py-1 text-micro text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Grasshopper 2 · Rhino 9 内置组件全量中文库
            </div>

            <h1 className="max-w-[19ch] text-display font-semibold">
              把 GH2 的每个电池，
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">讲成中文</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-3 bg-accent/20" />
              </span>
              。
            </h1>

            <p className="mt-5 max-w-[46ch] text-body text-muted">
              1410 个原生组件、23 个核心工具组件、83 个参数对象逐条翻译：它做什么、每个端口吃什么类型、该怎么连、什么时候该用它。
              翻译底稿取自 Grasshopper 2 自带帮助（组件右上角那个小问号），不是二手猜测。
            </p>

            <div className="mt-8 max-w-[560px]">
              <QuickSearchBox />
              <p className="mt-2.5 text-micro text-muted">
                支持中文名、英文名、拼音与拼音首字母 · 按 <kbd className="rounded border px-1">Ctrl</kbd>{" "}
                <kbd className="rounded border px-1">K</kbd> 随时唤起
              </p>
            </div>

            <dl className="mt-9 grid max-w-[560px] grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="text-micro uppercase tracking-widest text-muted">{s.label}</dt>
                  <dd className="mt-1 text-[26px] font-semibold leading-none tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <HeroPreview />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-micro uppercase tracking-[0.18em] text-muted">Learning Path</p>
            <h2 className="mt-2 text-h2 font-semibold">四站式入门路径</h2>
            <p className="mt-2 max-w-[54ch] text-small text-muted">
              从「这是什么东西」到「我能用它做出结果」，每一站都只讲你现在需要的那一层。
            </p>
          </div>
          <Link
            to="/learn"
            className="hidden shrink-0 items-center gap-1 text-small text-muted transition hover:text-ink sm:flex"
          >
            查看全部课程 <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATIONS.map((s, i) => (
            <Link
              key={s.slug}
              to={`/learn/${s.slug}`}
              className={cn(
                "group card relative flex flex-col p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lift",
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[13px] text-muted/70">{s.no}</span>
                <span className="rounded-full border px-2 py-0.5 text-micro text-muted">{s.tag}</span>
              </div>
              <h3 className="mt-6 text-h3 font-semibold">{s.title}</h3>
              <p className="mt-2 flex-1 text-small leading-relaxed text-muted">{s.desc}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-small text-accent opacity-0 transition group-hover:opacity-100">
                开始 <ArrowUpRight size={13} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y bg-surface-2/30">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-micro uppercase tracking-[0.18em] text-muted">By Library</p>
              <h2 className="mt-2 text-h2 font-semibold">按库速览</h2>
              <p className="mt-2 max-w-[56ch] text-small text-muted">
                GH2 把原生组件拆成 13 个库，另有「参数」库（点、数值、滑块、Listen/Shout）与「核心」库
                （簇、Chain、Wait!、读写文件），每个库下面按「章 → 节」组织。点进去就是完整清单。
              </p>
            </div>
            <Link to="/library" className="hidden shrink-0 items-center gap-1 text-small text-muted hover:text-ink sm:flex">
              打开组件库 <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(meta?.libs ?? []).map((lib) => (
              <Link
                key={lib.lib}
                to={`/library?lib=${lib.lib}`}
                className="group flex items-start gap-3 rounded-xl border bg-surface p-4 transition hover:border-accent/40 hover:shadow-card"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Boxes size={16} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-baseline gap-2">
                    <span className="text-[15px] font-medium">{lib.cn}</span>
                    <span className="font-mono text-micro uppercase text-muted">{lib.lib}</span>
                    <span className="ml-auto text-micro tabular-nums text-muted">{lib.count}</span>
                  </span>
                  <span className="mt-1 block truncate text-small text-muted">{lib.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-micro uppercase tracking-[0.18em] text-muted">Start Here</p>
            <h2 className="mt-2 text-h2 font-semibold">先认识这几个</h2>
            <p className="mt-2 max-w-[56ch] text-small text-muted">
              如果只记住六个组件，就记这六个——它们覆盖了新手八成以上的操作。
            </p>
          </div>
          <Link to="/library" className="hidden shrink-0 items-center gap-1 text-small text-muted hover:text-ink sm:flex">
            全部组件 <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((item) => (
            <Link
              key={item.id}
              to={`/c/${item.id}`}
              className="group card flex flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:border-accent/40"
            >
              <div className="flex items-center gap-2.5">
                <ComponentIcon icon={item.i} name={item.n} size={26} />
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-medium">
                    {item.c || item.n}
                  </span>
                  <span className="block truncate font-mono text-micro text-muted">{item.n}</span>
                </span>
                {item.d ? (
                  <span className="ml-auto rounded bg-accent/10 px-1.5 py-0.5 text-micro text-accent">精讲</span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.t.slice(0, 3).map((t) => (
                  <PortChip key={t} type={t} />
                ))}
              </div>
              <p className="text-small text-muted">
                {item.in} 个输入 · {item.out} 个输出 · {item.ch} / {item.seC || item.se}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border bg-[#0B0D10] px-6 py-10 text-[#F2F3F5] sm:px-10">
          <div className="absolute inset-0 opacity-[0.18] blueprint" />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-micro text-white/70">
                <Sparkles size={12} /> 画布识别
              </div>
              <h2 className="mt-4 text-h1 font-semibold">看不懂一张画布？拖进来。</h2>
              <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-white/65">
                把 .ghx 画布文件拖到页面，或者直接粘贴组件内容，站内会列出用到的每个组件，
                逐条给出中文名、作用与端口含义。识别不到的组件会原样标出英文名，一键转到搜索。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/identify"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13.5px] font-medium text-[#0B0D10] transition hover:brightness-105"
                >
                  <ScanLine size={15} /> 打开识别台
                </Link>
                <Link
                  to="/learn/data-structure"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-4 py-2 text-[13.5px] text-white/85 transition hover:bg-white/5"
                >
                  <BookOpen size={15} /> 先补数据结构
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12.5px]">
              {[
                { icon: <Layers size={14} />, t: "拖入画布", d: ".ghx / .gh2 文件" },
                { icon: <ScanLine size={14} />, t: "粘贴识别", d: "Ctrl+V 直接读" },
                { icon: <Boxes size={14} />, t: "逐条解读", d: "中文名 + 端口" },
                { icon: <ArrowUpRight size={14} />, t: "缺失兜底", d: "转搜索继续查" },
              ].map((cell) => (
                <div key={cell.t} className="rounded-xl border border-white/12 bg-white/[0.04] p-3">
                  <span className="text-white/70">{cell.icon}</span>
                  <p className="mt-2 font-medium">{cell.t}</p>
                  <p className="mt-0.5 text-white/50">{cell.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
