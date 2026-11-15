import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { LESSONS } from "@/data/learn";

export default function Lesson() {
  const { slug } = useParams();
  const index = LESSONS.findIndex((l) => l.slug === slug);
  const lesson = LESSONS[index];

  if (!lesson) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-24 text-center">
        <h1 className="text-h2 font-semibold">没有这一课</h1>
        <Link to="/learn" className="mt-4 inline-flex text-small text-accent">
          回到入门路径
        </Link>
      </div>
    );
  }

  const prev = index > 0 ? LESSONS[index - 1] : null;
  const next = index < LESSONS.length - 1 ? LESSONS[index + 1] : null;

  return (
    <article className="mx-auto max-w-[780px] px-4 py-12 sm:px-6">
      <Link to="/learn" className="inline-flex items-center gap-1 text-micro text-muted hover:text-ink">
        <ArrowLeft size={12} /> 入门路径
      </Link>

      <header className="mt-5">
        <p className="font-mono text-micro uppercase tracking-[0.18em] text-accent">
          Station {lesson.station} · 第 {lesson.no} 课 · {lesson.minutes}
        </p>
        <h1 className="mt-2 text-h1 font-semibold">{lesson.title}</h1>
        <p className="mt-2 text-body text-muted">{lesson.subtitle}</p>
      </header>

      <div className="mt-9 space-y-7">
        {lesson.blocks.map((block, i) => (
          <section key={i}>
            {block.h && <h2 className="mb-3 text-h2 font-semibold">{block.h}</h2>}
            {block.p?.map((text, j) => (
              <p key={j} className="mb-3 text-body leading-[1.9] text-ink/85">
                {text}
              </p>
            ))}
            {block.ol && (
              <ol className="my-4 space-y-2.5">
                {block.ol.map((item, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-[10.5px] text-accent">
                      {j + 1}
                    </span>
                    <span className="text-body leading-[1.8] text-ink/85">{item}</span>
                  </li>
                ))}
              </ol>
            )}
            {block.table && (
              <div className="my-4 overflow-x-auto rounded-xl border">
                <table className="w-full min-w-[520px] border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-surface-2/70 text-left">
                      {block.table.head.map((h) => (
                        <th key={h} className="whitespace-nowrap px-3.5 py-2.5 font-medium text-muted">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.table.rows.map((row, r) => (
                      <tr key={r} className="border-t">
                        {row.map((cell, c) => (
                          <td key={c} className={c === 0 ? "px-3.5 py-2.5 font-medium" : "px-3.5 py-2.5 text-muted"}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {block.note && (
              <div className="my-4 flex gap-2.5 rounded-lg border-l-2 border-accent bg-accent/[0.05] px-3.5 py-3">
                <Info size={14} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-[13px] leading-relaxed text-ink/85">{block.note}</p>
              </div>
            )}
          </section>
        ))}
      </div>

      <nav className="mt-12 flex items-stretch gap-3 border-t pt-6">
        {prev ? (
          <Link
            to={`/learn/${prev.slug}`}
            className="group flex flex-1 flex-col rounded-xl border p-4 transition hover:border-accent/40"
          >
            <span className="flex items-center gap-1 text-micro text-muted">
              <ArrowLeft size={12} /> 上一课
            </span>
            <span className="mt-1 text-[14px] font-medium">{prev.title}</span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}
        {next ? (
          <Link
            to={`/learn/${next.slug}`}
            className="group flex flex-1 flex-col items-end rounded-xl border p-4 text-right transition hover:border-accent/40"
          >
            <span className="flex items-center gap-1 text-micro text-muted">
              下一课 <ArrowRight size={12} />
            </span>
            <span className="mt-1 text-[14px] font-medium">{next.title}</span>
          </Link>
        ) : (
          <Link
            to="/recipes"
            className="group flex flex-1 flex-col items-end rounded-xl border border-accent/40 bg-accent/[0.05] p-4 text-right"
          >
            <span className="flex items-center gap-1 text-micro text-accent">
              下一步 <ArrowRight size={12} />
            </span>
            <span className="mt-1 text-[14px] font-medium">去看常用配方</span>
          </Link>
        )}
      </nav>
    </article>
  );
}
