import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { GLOSSARY } from "@/data/glossary";
import { cn } from "@/lib/utils";

export default function Glossary() {
  const [term, setTerm] = useState("");

  const groups = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return GLOSSARY;
    return GLOSSARY.map((group) => ({
      ...group,
      terms: group.terms.filter(
        (t) => t.en.toLowerCase().includes(q) || t.cn.includes(term.trim()) || t.note.includes(term.trim()),
      ),
    })).filter((group) => group.terms.length > 0);
  }, [term]);

  const total = GLOSSARY.reduce((s, g) => s + g.terms.length, 0);

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-[calc(84px_+_var(--banner-h))]">
            <p className="text-micro uppercase tracking-[0.18em] text-muted">术语 {total}</p>
            <nav className="mt-3 space-y-1">
              {GLOSSARY.map((group) => (
                <a
                  key={group.title}
                  href={`#g-${encodeURIComponent(group.title)}`}
                  className="block rounded-md px-2 py-1.5 text-[13px] text-muted transition hover:bg-surface-2 hover:text-ink"
                >
                  {group.title}
                  <span className="ml-1.5 text-[10px] opacity-50">{group.terms.length}</span>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div>
          <p className="text-micro uppercase tracking-[0.18em] text-muted">Glossary</p>
          <h1 className="mt-2 text-h1 font-semibold">中英术语表</h1>
          <p className="mt-3 max-w-[62ch] text-body leading-relaxed text-muted">
            GH2 的界面是英文的，教程与视频也是。这一页把最常撞见的词按主题收在一起，
            每个词都写一句「它在 GH2 里到底指什么」。
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-xl border bg-surface px-3 py-2.5">
            <Search size={15} className="text-muted" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="过滤术语：tree / 树 / 分支"
              aria-label="过滤术语"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted/70"
            />
            <span className="shrink-0 text-micro text-muted">{groups.reduce((s, g) => s + g.terms.length, 0)} 条</span>
          </div>

          <div className="mt-8 space-y-10">
            {groups.map((group) => (
              <section key={group.title} id={`g-${encodeURIComponent(group.title)}`} className="scroll-mt-24">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-h2 font-semibold">{group.title}</h2>
                  <span className="text-micro text-muted">{group.terms.length}</span>
                </div>
                <p className="mt-1 text-small text-muted">{group.desc}</p>
                <dl className="mt-4 divide-y overflow-hidden rounded-xl border bg-surface">
                  {group.terms.map((t) => (
                    <div key={t.en} className="grid gap-1 px-4 py-3 sm:grid-cols-[190px_1fr] sm:gap-4">
                      <dt className="flex items-baseline gap-2">
                        <span className="font-mono text-[12.5px] text-muted">{t.en}</span>
                        <span className="text-[13.5px] font-medium">{t.cn}</span>
                      </dt>
                      <dd className={cn("text-[13px] leading-relaxed text-muted")}>{t.note}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
