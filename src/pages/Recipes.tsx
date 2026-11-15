import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, TriangleAlert, Workflow } from "lucide-react";
import { RECIPES } from "@/data/recipes";
import { cn } from "@/lib/utils";

export default function Recipes() {
  const [level, setLevel] = useState<"全部" | "入门" | "进阶">("全部");
  const [open, setOpen] = useState<string | null>(RECIPES[0]?.id ?? null);

  const list = useMemo(() => (level === "全部" ? RECIPES : RECIPES.filter((r) => r.level === level)), [level]);

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-12 sm:px-6">
      <p className="text-micro uppercase tracking-[0.18em] text-muted">Recipes</p>
      <h1 className="mt-2 text-h1 font-semibold">常用组合配方</h1>
      <p className="mt-3 max-w-[64ch] text-body leading-relaxed text-muted">
        单个组件会用了，接下来是「怎么串」。这里每一份配方都是一条能落地的链路：
        用哪些组件、按什么顺序接、哪里最容易翻车。
      </p>

      <div className="mt-6 flex gap-1.5">
        {(["全部", "入门", "进阶"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setLevel(item)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-small transition",
              level === item ? "border-accent/50 bg-accent/10 text-accent" : "text-muted hover:text-ink",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {list.map((recipe) => {
          const expanded = open === recipe.id;
          return (
            <article
              key={recipe.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-surface transition",
                expanded ? "border-accent/40 shadow-card" : "hover:border-line",
              )}
            >
              <button
                onClick={() => setOpen(expanded ? null : recipe.id)}
                aria-expanded={expanded}
                className="flex w-full items-start gap-4 px-5 py-4 text-left"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Workflow size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[15.5px] font-medium">{recipe.title}</span>
                    <span className="rounded-full border px-2 py-0.5 text-[10.5px] text-muted">{recipe.level}</span>
                    {recipe.tags.map((tag) => (
                      <span key={tag} className="text-[10.5px] text-muted/70">
                        #{tag}
                      </span>
                    ))}
                  </span>
                  <span className="mt-1.5 block text-small leading-relaxed text-muted">{recipe.purpose}</span>
                </span>
                <ChevronDown
                  size={16}
                  className={cn("mt-1 shrink-0 text-muted transition-transform", expanded && "rotate-180")}
                />
              </button>

              {expanded && (
                <div className="border-t bg-surface-2/30 px-5 py-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {recipe.chain.map((step, i) => (
                      <span key={`${step}-${i}`} className="flex items-center gap-2">
                        <span className="rounded-md border bg-surface px-2 py-1 font-mono text-[11.5px]">{step}</span>
                        {i < recipe.chain.length - 1 && <span className="text-muted/50">→</span>}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-6 sm:grid-cols-[1.3fr_1fr]">
                    <div>
                      <p className="text-micro font-medium uppercase tracking-widest text-muted">接线顺序</p>
                      <ol className="mt-2.5 space-y-2">
                        {recipe.steps.map((step, i) => (
                          <li key={i} className="flex gap-2.5">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface font-mono text-[10.5px] text-muted">
                              {i + 1}
                            </span>
                            <span className="text-[13px] leading-relaxed text-ink/85">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <p className="text-micro font-medium uppercase tracking-widest text-muted">容易翻车</p>
                      <ul className="mt-2.5 space-y-2">
                        {recipe.pitfalls.map((pit, i) => (
                          <li key={i} className="flex gap-2 rounded-lg border-l-2 border-amber-500/60 bg-amber-500/[0.06] px-2.5 py-2">
                            <TriangleAlert size={12} className="mt-0.5 shrink-0 text-amber-600" />
                            <span className="text-[12.5px] leading-relaxed text-ink/85">{pit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-8 text-small text-muted">
        配方里提到的组件都能在
        <Link to="/library" className="mx-1 text-accent link-underline">组件库</Link>
        里查到端口与说明；参数对象（点、圆、滑块、Panel）属于 GH2 的「参数」面板，不在原生组件库内。
      </p>
    </div>
  );
}
