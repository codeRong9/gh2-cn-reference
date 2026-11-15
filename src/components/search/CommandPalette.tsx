import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CornerDownLeft, Search, X } from "lucide-react";
import { loadIndex } from "@/lib/dataClient";
import type { IndexItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { scoreItem } from "@/features/search/score";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SUGGESTIONS = ["Addition", "移动", "点阵", "曲面", "列表", "随机", "布尔"];

export function CommandPalette({ open, onClose }: Props) {
  const [index, setIndex] = useState<IndexItem[]>([]);
  const [term, setTerm] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open || index.length) return;
    loadIndex()
      .then(setIndex)
      .catch((err) => console.error(err));
  }, [open, index.length]);

  useEffect(() => {
    if (!open) return;
    setTerm("");
    setActive(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open]);

  const results = useMemo(() => {
    if (!term.trim()) return [];
    return index
      .map((item) => ({ item, score: scoreItem(item, term) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((x) => x.item);
  }, [index, term]);

  const go = (id: string) => {
    onClose();
    navigate(`/c/${id}`);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
      return;
    }
    if (!results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((v) => (v + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((v) => (v - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[active].id);
    }
  };

  useEffect(() => {
    setActive(0);
  }, [term]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/35 px-4 pt-[12vh] backdrop-blur-[2px] animate-fade-in"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="全局搜索"
    >
      <div
        className="w-full max-w-[640px] overflow-hidden rounded-2xl border bg-surface shadow-lift"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b px-4 py-3.5">
          <Search size={17} className="text-muted" />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="搜索组件：中文名 / 英文名 / 拼音 / 分类"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted/70"
          />
          <button
            onClick={onClose}
            aria-label="关闭搜索"
            className="rounded-md p-1 text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto">
          {!term.trim() && (
            <div className="px-4 py-5">
              <p className="mb-3 text-micro font-medium uppercase tracking-widest text-muted">试一试</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTerm(s)}
                    className="rounded-full border px-3 py-1 text-small text-muted transition hover:border-accent/40 hover:text-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {term.trim() && results.length === 0 && (
            <p className="px-4 py-8 text-center text-small text-muted">
              没有找到与「{term}」匹配的组件，换个中文名或英文名试试。
            </p>
          )}

          {results.map((item, i) => (
            <button
              key={item.id}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(item.id)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-line/60 px-4 py-2.5 text-left transition",
                i === active ? "bg-surface-2" : "hover:bg-surface-2/60",
              )}
            >
              <span className="w-[92px] shrink-0 font-mono text-micro uppercase tracking-wide text-muted">
                {item.l}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">
                  {item.c || item.n}
                  {item.c && <span className="ml-2 font-mono text-micro text-muted">{item.n}</span>}
                </span>
                <span className="block truncate text-micro text-muted">
                  {item.ch} · {item.seC || item.se}
                </span>
              </span>
              {item.d ? (
                <span className="rounded bg-accent/10 px-1.5 py-0.5 text-micro text-accent">精讲</span>
              ) : null}
              <ArrowRight size={14} className={cn("shrink-0 text-muted", i === active && "text-accent")} />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t bg-surface-2/60 px-4 py-2 text-micro text-muted">
          <span className="flex items-center gap-1">
            <CornerDownLeft size={12} /> 打开
          </span>
          <span>↑↓ 选择 · Esc 关闭</span>
        </div>
      </div>
    </div>
  );
}
