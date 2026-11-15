import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { loadIndex } from "@/lib/dataClient";
import type { IndexItem } from "@/lib/types";
import { scoreItem } from "@/features/search/score";
import { cn } from "@/lib/utils";

export function QuickSearchBox({ placeholder = "搜索组件：加法 / Addition / jiafa / 曲面" }: { placeholder?: string }) {
  const [index, setIndex] = useState<IndexItem[]>([]);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadIndex().then(setIndex).catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = useMemo(() => {
    if (!term.trim()) return [];
    return index
      .map((item) => ({ item, score: scoreItem(item, term) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((x) => x.item);
  }, [index, term]);

  const submit = () => {
    if (results.length) {
      navigate(`/c/${results[active]?.id ?? results[0].id}`);
    } else {
      navigate(`/library?q=${encodeURIComponent(term)}`);
    }
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 shadow-card transition focus-within:border-accent/50 focus-within:shadow-lift">
        <Search size={17} className="shrink-0 text-muted" />
        <input
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((v) => Math.min(v + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((v) => Math.max(v - 1, 0));
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          aria-label="搜索组件"
          className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted/70"
        />
        <span className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] text-muted sm:inline">
          Enter
        </span>
      </div>

      {open && term.trim() && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border bg-surface shadow-lift animate-fade-up">
          {results.length === 0 && (
            <p className="px-4 py-5 text-small text-muted">
              没有直接匹配的组件。按 Enter 用关键词去组件库里筛。
            </p>
          )}
          {results.map((item, i) => (
            <button
              key={item.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                navigate(`/c/${item.id}`);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left transition",
                i === active ? "bg-surface-2" : "hover:bg-surface-2/60",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px]">
                  {item.c || item.n}
                  <span className="ml-2 font-mono text-micro text-muted">{item.n}</span>
                </span>
                <span className="block truncate text-micro text-muted">
                  {item.ch} · {item.seC || item.se}
                </span>
              </span>
              {item.d ? <span className="rounded bg-accent/10 px-1.5 text-micro text-accent">精讲</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
