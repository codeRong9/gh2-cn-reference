import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { loadIndex, loadMeta, prefetchLib } from "@/lib/dataClient";
import type { IndexItem, Meta } from "@/lib/types";
import { CategoryTree } from "@/components/library/CategoryTree";
import { ComponentIcon } from "@/components/library/ComponentIcon";
import { PortChip } from "@/components/common/PortChip";
import { scoreItem } from "@/features/search/score";
import { cn } from "@/lib/utils";

export default function Library() {
  const [params, setParams] = useSearchParams();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [index, setIndex] = useState<IndexItem[]>([]);
  const [term, setTerm] = useState(params.get("q") ?? "");
  const [onlyDetail, setOnlyDetail] = useState(params.get("detail") === "1");
  const [types, setTypes] = useState<string[]>(params.get("type") ? [params.get("type")!] : []);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const lib = params.get("lib");
  const section = params.get("sec");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMeta().then(setMeta).catch((err) => console.error(err));
    loadIndex().then(setIndex).catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (term) next.set("q", term);
    else next.delete("q");
    if (onlyDetail) next.set("detail", "1");
    else next.delete("detail");
    if (types.length === 1) next.set("type", types[0]);
    else next.delete("type");
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, onlyDetail, types]);

  const setLib = (value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set("lib", value);
    else next.delete("lib");
    next.delete("sec");
    setParams(next);
    setSidebarOpen(false);
  };

  const setSection = (value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set("sec", value);
    else next.delete("sec");
    setParams(next);
  };

  const list = useMemo(() => {
    let items = index;
    if (lib) items = items.filter((i) => i.l === lib);
    if (section) items = items.filter((i) => i.se === section);
    if (onlyDetail) items = items.filter((i) => i.d);
    if (types.length) items = items.filter((i) => i.t.some((t) => types.includes(t)));
    if (term.trim()) {
      items = items
        .map((item) => ({ item, score: scoreItem(item, term) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.item);
    }
    return items;
  }, [index, lib, section, onlyDetail, types, term]);

  const virtualizer = useVirtualizer({
    count: list.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 66,
    overscan: 8,
  });

  const topTypes = useMemo(
    () => Object.entries(meta?.typeCounts ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 10),
    [meta],
  );

  const activeLib = meta?.libs.find((l) => l.lib === lib);

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted">Library</p>
          <h1 className="mt-2 text-h1 font-semibold">
            {activeLib ? activeLib.cn : "全部组件"}
            <span className="ml-3 text-[13px] font-normal text-muted">
              {list.length} / {index.length}
            </span>
          </h1>
          <p className="mt-2 max-w-[60ch] text-small text-muted">
            {activeLib?.desc ?? "Grasshopper 2 的全部原生组件，按库与章节组织；点任意一行看端口、连线与用法。"}
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-small text-muted transition hover:text-ink lg:hidden"
        >
          <Filter size={14} /> 分类
        </button>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[228px_1fr]">
        <aside
          className={cn(
            "lg:sticky lg:top-[calc(76px_+_var(--banner-h))] lg:block lg:self-start",
            sidebarOpen ? "block" : "hidden",
          )}
        >
          <div className="max-h-[calc(100vh-100px)] overflow-y-auto pr-1">
            <CategoryTree
              libs={meta?.libs ?? []}
              activeLib={lib}
              activeSection={section}
              onSelectLib={setLib}
              onSelectSection={setSection}
            />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="sticky top-[calc(60px_+_var(--banner-h))] z-20 -mx-1 bg-bg/90 px-1 pb-3 pt-1 backdrop-blur">
            <div className="flex items-center gap-2 rounded-xl border bg-surface px-3 py-2.5">
              <Search size={15} className="shrink-0 text-muted" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="在当前结果里搜索：中文名 / 英文名 / 拼音"
                aria-label="搜索组件"
                className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted/70"
              />
              {term && (
                <button onClick={() => setTerm("")} aria-label="清空搜索" className="text-muted hover:text-ink">
                  <X size={14} />
                </button>
              )}
              <button
                onClick={() => setOnlyDetail((v) => !v)}
                className={cn(
                  "ml-1 hidden shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-micro transition sm:flex",
                  onlyDetail ? "border-accent/40 bg-accent/10 text-accent" : "text-muted hover:text-ink",
                )}
              >
                <SlidersHorizontal size={12} /> 仅精讲
              </button>
            </div>

            <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-1">
              {topTypes.map(([type, count]) => {
                const active = types.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() =>
                      setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
                    }
                    className={cn(
                      "shrink-0 rounded-full border px-2.5 py-1 text-micro transition",
                      active
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "text-muted hover:border-line hover:text-ink",
                    )}
                  >
                    {type}
                    <span className="ml-1 opacity-50">{count}</span>
                  </button>
                );
              })}
              {(types.length > 0 || onlyDetail) && (
                <button
                  onClick={() => {
                    setTypes([]);
                    setOnlyDetail(false);
                  }}
                  className="shrink-0 rounded-full border border-dashed px-2.5 py-1 text-micro text-muted hover:text-ink"
                >
                  清除筛选
                </button>
              )}
            </div>
          </div>

          {list.length === 0 ? (
            <div className="card mt-4 flex flex-col items-center gap-2 px-6 py-16 text-center">
              <p className="text-[15px] font-medium">没有符合条件的组件</p>
              <p className="max-w-[40ch] text-small text-muted">
                试着清掉类型筛选，或换一个更短的关键词（例如「曲线」「list」「点」）。
              </p>
            </div>
          ) : (
            <div ref={scrollRef} className="mt-3 max-h-[calc(100vh-190px)] overflow-y-auto rounded-xl border bg-surface">
              <div className="relative" style={{ height: virtualizer.getTotalSize() }}>
                {virtualizer.getVirtualItems().map((row) => {
                  const item = list[row.index];
                  return (
                    <Link
                      key={item.id}
                      to={`/c/${item.id}`}
                      onMouseEnter={() => prefetchLib(item.l)}
                      className="absolute inset-x-0 flex items-center gap-3 border-b border-line/60 px-3.5 transition hover:bg-surface-2/70"
                      style={{ height: row.size, transform: `translateY(${row.start}px)` }}
                    >
                      <ComponentIcon icon={item.i} name={item.n} size={26} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="truncate text-[14px] font-medium">{item.c || item.n}</span>
                          <span className="truncate font-mono text-micro text-muted">{item.n}</span>
                          {item.d ? (
                            <span className="shrink-0 rounded bg-accent/10 px-1 text-[10px] text-accent">精讲</span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate text-micro text-muted">
                          {item.ch} · {item.seC || item.se}
                        </span>
                      </span>
                      <span className="hidden shrink-0 items-center gap-1 sm:flex">
                        {item.t.slice(0, 2).map((t) => (
                          <PortChip key={t} type={t} />
                        ))}
                      </span>
                      <span className="w-[62px] shrink-0 text-right text-micro tabular-nums text-muted">
                        {item.in} → {item.out}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
