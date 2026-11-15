import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight, Lightbulb, TriangleAlert } from "lucide-react";
import { loadComponent, loadIndex } from "@/lib/dataClient";
import type { ComponentRecord, IndexItem } from "@/lib/types";
import { ComponentIcon } from "@/components/library/ComponentIcon";
import { PortTable } from "@/components/library/PortTable";
import { WiringDiagram } from "@/components/library/WiringDiagram";
import { CopyButton } from "@/components/common/CopyButton";

export default function ComponentDetail() {
  const { id = "" } = useParams();
  const [record, setRecord] = useState<ComponentRecord | null>(null);
  const [index, setIndex] = useState<IndexItem[]>([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setRecord(null);
    setMissing(false);
    loadComponent(id)
      .then((r) => {
        if (!r) setMissing(true);
        setRecord(r);
      })
      .catch((err) => {
        console.error(err);
        setMissing(true);
      });
    if (!index.length) loadIndex().then(setIndex).catch((err) => console.error(err));
  }, [id]);

  if (missing) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-24 text-center">
        <h1 className="text-h2 font-semibold">没有找到这个组件</h1>
        <p className="mt-2 text-small text-muted">编号 {id} 不在当前数据里，可能是链接过期。</p>
        <Link to="/library" className="mt-6 inline-flex items-center gap-1.5 text-small text-accent">
          <ArrowLeft size={14} /> 回到组件库
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6">
        <div className="h-6 w-40 animate-pulse rounded bg-surface-2" />
        <div className="mt-6 h-10 w-72 animate-pulse rounded bg-surface-2" />
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-surface-2" />
          ))}
        </div>
      </div>
    );
  }

  const related = (record.detail?.related ?? [])
    .map((rid) => index.find((i) => i.id === rid))
    .filter(Boolean) as IndexItem[];

  const detail = record.detail;
  const summary = record.summary;

  return (
    <article className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6">
      <nav className="flex flex-wrap items-center gap-1 text-micro text-muted" aria-label="面包屑">
        <Link to="/library" className="hover:text-ink">组件库</Link>
        <ChevronRight size={11} />
        <Link to={`/library?lib=${record.lib}`} className="hover:text-ink">{record.libCn}</Link>
        <ChevronRight size={11} />
        <Link to={`/library?lib=${record.lib}&sec=${encodeURIComponent(record.section)}`} className="hover:text-ink">
          {record.sectionCn || record.section}
        </Link>
        <ChevronRight size={11} />
        <span className="text-ink/70">{record.name}</span>
      </nav>

      <header className="mt-5 flex flex-wrap items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-surface shadow-card">
          <ComponentIcon icon={record.icon} name={record.name} size={34} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="text-h1 font-semibold">{record.cn || record.name}</h1>
            <span className="font-mono text-[13px] text-muted">{record.name}</span>
            {record.hasDetail && (
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-micro text-accent">精讲</span>
            )}
            {record.lib === "params" && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5 text-micro text-muted">参数对象</span>
            )}
          </div>
          <p className="mt-1 text-micro text-muted">
            {record.chapter} / {record.section} · {record.inputs.length} 输入 · {record.outputs.length} 输出
          </p>
        </div>
        <div className="flex gap-1.5">
          <CopyButton value={record.name} label="复制名称" />
          {record.guid && <CopyButton value={record.guid} label="复制 GUID" />}
        </div>
      </header>

      <section className="mt-6 rounded-xl border-l-2 border-accent bg-accent/[0.05] px-4 py-3.5">
        {summary ? (
          <p className="text-[15px] leading-relaxed">{summary}</p>
        ) : (
          <>
            <p className="text-[14px] leading-relaxed text-ink/80">{record.info || "GH2 未提供这个组件的说明。"}</p>
            <p className="mt-1.5 text-micro text-muted">
              以上为 Grasshopper 2 原文说明，中文释义待校。
            </p>
          </>
        )}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)]">
        <div>
          <h2 className="mb-2.5 text-micro font-medium uppercase tracking-[0.16em] text-muted">输入端口</h2>
          <PortTable ports={record.inputs} side="input" />
        </div>
        <div className="order-first lg:order-none">
          <h2 className="mb-2.5 text-micro font-medium uppercase tracking-[0.16em] text-muted">组件形态</h2>
          <WiringDiagram
            icon={record.icon}
            name={record.name}
            cnName={record.cn}
            inputs={record.inputs}
            outputs={record.outputs}
          />
          <div className="mt-3 rounded-xl border bg-surface p-3.5">
            <p className="text-micro uppercase tracking-[0.14em] text-muted">在 GH2 中的位置</p>
            <p className="mt-2 text-[12.5px] leading-relaxed">
              {record.libCn} 库 → {record.chapter} → {record.sectionCn || record.section}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-muted">
              打开 GH2 工具面板，按这个路径逐级展开即可找到同名电池；面板顶部搜索英文名更快。
            </p>
            {record.guid && (
              <div className="mt-2.5 border-t pt-2.5">
                <p className="text-[11px] text-muted">组件代号（IoId）</p>
                <p className="mono mt-1 break-all text-[11px] leading-relaxed text-ink/70">{record.guid}</p>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
                  把组件拖进本站识别台，或直接粘贴这串代号，都能认出它。
                </p>
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="mb-2.5 text-micro font-medium uppercase tracking-[0.16em] text-muted">输出端口</h2>
          <PortTable ports={record.outputs} side="output" />
        </div>
      </section>

      {detail ? (
        <section className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-10">
            {detail.concept && (
              <div>
                <h2 className="text-h2 font-semibold">它是怎么工作的</h2>
                <p className="mt-3 text-body leading-[1.85] text-ink/85">{detail.concept}</p>
              </div>
            )}

            {detail.steps?.length ? (
              <div>
                <h2 className="text-h2 font-semibold">怎么用</h2>
                <ol className="mt-4 space-y-3">
                  {detail.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 font-mono text-[11px] text-accent">
                        {i + 1}
                      </span>
                      <p className="text-body leading-[1.8] text-ink/85">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {detail.scenes?.length ? (
              <div>
                <h2 className="text-h2 font-semibold">典型场景</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {detail.scenes.map((scene) => (
                    <div key={scene.title} className="rounded-xl border bg-surface p-4">
                      <p className="text-[14px] font-medium">{scene.title}</p>
                      <p className="mt-1.5 text-small leading-relaxed text-muted">{scene.body}</p>
                      {scene.wiring && (
                        <p className="mt-2.5 rounded-md bg-surface-2 px-2.5 py-1.5 font-mono text-[11px] text-muted">
                          {scene.wiring}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {detail.pitfalls?.length ? (
              <div>
                <h2 className="text-h2 font-semibold">容易踩的坑</h2>
                <ul className="mt-4 space-y-2.5">
                  {detail.pitfalls.map((p, i) => (
                    <li key={i} className="flex gap-2.5 rounded-lg border-l-2 border-amber-500/70 bg-amber-500/[0.06] px-3 py-2">
                      <TriangleAlert size={14} className="mt-0.5 shrink-0 text-amber-600" />
                      <p className="text-[13px] leading-relaxed text-ink/85">{p}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            {detail.tip && (
              <div className="rounded-xl border border-accent/25 bg-accent/[0.05] p-4">
                <p className="flex items-center gap-1.5 text-micro font-medium uppercase tracking-widest text-accent">
                  <Lightbulb size={12} /> 一句话记住
                </p>
                <p className="mt-2 text-[13px] leading-relaxed">{detail.tip}</p>
              </div>
            )}
            {related.length > 0 && (
              <div className="rounded-xl border bg-surface p-4">
                <p className="text-micro font-medium uppercase tracking-widest text-muted">相关组件</p>
                <ul className="mt-3 space-y-1.5">
                  {related.map((r) => (
                    <li key={r.id}>
                      <Link
                        to={`/c/${r.id}`}
                        className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-[13px] transition hover:bg-surface-2"
                      >
                        <ComponentIcon icon={r.i} name={r.n} size={18} />
                        <span className="truncate">{r.c || r.n}</span>
                        <span className="ml-auto truncate font-mono text-[10px] text-muted">{r.n}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="rounded-xl border bg-surface p-4 text-[11.5px] leading-relaxed text-muted">
              <p className="flex items-center gap-1.5 text-micro font-medium uppercase tracking-widest text-muted">
                <BookOpen size={12} /> 数据出处
              </p>
              <p className="mt-2 font-mono">{record.fullTypeName}</p>
              {record.guid && <p className="mt-1 font-mono opacity-70">{record.guid}</p>}
              <p className="mt-2">
                取自 Grasshopper 2（Rhino 9）内置组件程序集，端口与说明来自程序集里的原始定义。
              </p>
            </div>
          </aside>
        </section>
      ) : (
        <section className="mt-12 rounded-xl border border-dashed px-5 py-8">
          <h2 className="text-h3 font-semibold">这个组件还没有精讲</h2>
          <p className="mt-2 max-w-[62ch] text-small leading-relaxed text-muted">
            上面的端口与说明都来自 GH2 原始定义，可以直接用；精讲（原理、连线步骤、典型场景、易错点）
            正在按学习路径的顺序补齐。想先看同类组件的讲法，可以从下面的分类里找带「精讲」标记的。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/library?lib=${record.lib}&sec=${encodeURIComponent(record.section)}`}
              className="rounded-lg border px-3 py-1.5 text-small text-muted transition hover:text-ink"
            >
              同类组件（{record.sectionCn || record.section}）
            </Link>
            <Link
              to="/library?detail=1"
              className="rounded-lg border px-3 py-1.5 text-small text-muted transition hover:text-ink"
            >
              只看已有精讲
            </Link>
          </div>
        </section>
      )}
    </article>
  );
}
