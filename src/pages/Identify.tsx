import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardPaste, FileUp, Info, Loader2, MousePointerClick, Search, Upload } from "lucide-react";
import { buildIndex, scanText, type MatchResult, type NameIndex } from "@/features/identify/matcher";
import { isProbablyBinary, parseBinary } from "@/features/identify/parseGh2";
import { looksLikeGhx, parseGhx, parseGhxText } from "@/features/identify/parseGhx";
import { ComponentIcon } from "@/components/library/ComponentIcon";
import { PortChip } from "@/components/common/PortChip";
import type { ComponentRecord } from "@/lib/types";

interface State {
  status: "idle" | "working" | "done" | "error";
  source: string;
  results: MatchResult[];
  unknown: string[];
  note: string;
}

const SAMPLE = `<?xml version="1.0" encoding="utf-8"?>
<Archive name="Root">
  <items count="3">
    <item name="Object" type_name="gh_documentobject" type_code="100">
      <items count="1">
        <item name="Name" type_name="gh_string" type_code="10">Addition</item>
      </items>
    </item>
    <item name="Object" type_name="gh_documentobject" type_code="100">
      <items count="1">
        <item name="Name" type_name="gh_string" type_code="10">Divide By Count</item>
      </items>
    </item>
    <item name="Object" type_name="gh_documentobject" type_code="100">
      <items count="1">
        <item name="Name" type_name="gh_string" type_code="10">Loft From Curves</item>
      </items>
    </item>
  </items>
</Archive>`;

export default function Identify() {
  const [index, setIndex] = useState<NameIndex | null>(null);
  const [state, setState] = useState<State>({ status: "idle", source: "", results: [], unknown: [], note: "" });
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    buildIndex().then(setIndex).catch((err) => console.error(err));
  }, []);

  const finish = useCallback((source: string, results: MatchResult[], unknown: string[], note: string) => {
    setState({ status: "done", source, results, unknown, note });
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!index) return;
      setState((s) => ({ ...s, status: "working", source: file.name, note: "" }));
      const buffer = await file.arrayBuffer();
      if (looksLikeGhx(new TextDecoder("utf-8", { fatal: false }).decode(buffer.slice(0, 4000)))) {
        const parsed = parseGhx(buffer, index);
        finish(
          `${file.name}（.ghx 画布）`,
          parsed.objects,
          parsed.unknown,
          parsed.total ? `从 ${parsed.total} 个画布对象中识别到 ${parsed.objects.length} 个组件。` : "这个文件里没有找到组件对象。",
        );
        return;
      }
      if (isProbablyBinary(buffer)) {
        const results = parseBinary(buffer, index);
        finish(`${file.name}（二进制画布）`, results, [], `GH2 的 .gh2 是二进制格式，这里通过内嵌的名称与 GUID 反查，识别到 ${results.length} 个组件。`);
        return;
      }
      const text = new TextDecoder("utf-8", { fatal: false }).decode(buffer);
      const results = scanText(text, index);
      finish(`${file.name}（文本）`, results, [], `按已知组件名扫描全文，识别到 ${results.length} 个组件。`);
    },
    [finish, index],
  );

  const handleText = useCallback(
    (text: string) => {
      if (!index || !text.trim()) return;
      setState((s) => ({ ...s, status: "working", source: "粘贴内容", note: "" }));
      if (looksLikeGhx(text)) {
        const parsed = parseGhxText(text, index);
        finish("粘贴的画布内容", parsed.objects, parsed.unknown, `从 ${parsed.total} 个对象中识别到 ${parsed.objects.length} 个组件。`);
        return;
      }
      const results = scanText(text, index);
      finish("粘贴的文本", results, [], `按已知组件名扫描，识别到 ${results.length} 个组件。`);
    },
    [finish, index],
  );

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const text = event.clipboardData?.getData("text/plain");
      if (text) {
        event.preventDefault();
        handleText(text);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleText]);

  return (
    <div className="mx-auto max-w-[1080px] px-4 py-10 sm:px-6">
      <p className="text-micro uppercase tracking-[0.18em] text-muted">Identify</p>
      <h1 className="mt-2 text-h1 font-semibold">识别台</h1>
      <p className="mt-3 max-w-[64ch] text-body leading-relaxed text-muted">
        把一张看不懂的画布丢进来，站内会列出它用到的每个组件，并给出中文名、作用与端口含义。
        支持拖入 .ghx / .gh2 文件、直接粘贴画布内容、或把从 GH2 拖出的文本放进来。
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) {
            void handleFile(file);
            return;
          }
          const text = e.dataTransfer.getData("text/plain");
          if (text) {
            handleText(text);
            return;
          }
          const uri = e.dataTransfer.getData("text/uri-list");
          if (uri) handleText(uri);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`mt-7 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition ${
          dragging ? "border-accent bg-accent/[0.06]" : "border-line bg-surface-2/40 hover:border-accent/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".ghx,.gh2,.gh,.xml,.txt"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-card">
          <Upload size={18} className="text-accent" />
        </span>
        <p className="mt-4 text-[15px] font-medium">把画布文件拖到这里</p>
        <p className="mt-1.5 text-small text-muted">.ghx / .gh2 / .gh，或点击选择文件</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-micro text-muted">
          <span className="flex items-center gap-1"><FileUp size={12} /> 拖入文件</span>
          <span className="flex items-center gap-1"><ClipboardPaste size={12} /> Ctrl+V 粘贴</span>
          <span className="flex items-center gap-1"><MousePointerClick size={12} /> 拖入组件文本</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => handleText(SAMPLE)}
          className="rounded-lg border px-3 py-1.5 text-small text-muted transition hover:border-accent/40 hover:text-ink"
        >
          用示例画布试一下
        </button>
        <Link
          to="/library"
          className="rounded-lg border px-3 py-1.5 text-small text-muted transition hover:border-accent/40 hover:text-ink"
        >
          直接去组件库搜
        </Link>
      </div>

      {state.status === "working" && (
        <div className="mt-6 flex items-center gap-2 text-small text-muted">
          <Loader2 size={14} className="animate-spin" /> 正在解析…
        </div>
      )}

      {state.status === "done" && (
        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-h2 font-semibold">
              识别结果
              <span className="ml-2 text-[13px] font-normal text-muted">
                {state.source} · {state.results.length} 个组件
              </span>
            </h2>
            <span className="text-micro text-muted">{state.note}</span>
          </div>

          {state.results.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed px-5 py-10 text-center">
              <p className="text-[15px] font-medium">没识别出可对应的 GH2 原生组件</p>
              <p className="mx-auto mt-2 max-w-[52ch] text-small leading-relaxed text-muted">
                可能是文件是 GH1 画布、只用了参数对象（点、滑块、Panel），或者内容不是画布。
                试试在组件库里按英文名搜索。
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y overflow-hidden rounded-xl border bg-surface">
              {state.results.map((item) => {
                const record = item.record as ComponentRecord;
                const open = expanded === record.id;
                return (
                  <li key={record.id}>
                    <button
                      onClick={() => setExpanded(open ? null : record.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-2/60"
                    >
                      <ComponentIcon icon={record.icon} name={record.name} size={26} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline gap-2">
                          <span className="truncate text-[14.5px] font-medium">{record.cn || record.name}</span>
                          <span className="truncate font-mono text-micro text-muted">{record.name}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-micro text-muted">
                          {record.libCn} · {record.chapter} / {record.sectionCn || record.section}
                        </span>
                      </span>
                      <span className="hidden shrink-0 gap-1 sm:flex">
                        {record.inputs.slice(0, 2).map((p) => (
                          <PortChip key={p.name} type={p.type} />
                        ))}
                      </span>
                      <Link
                        to={`/c/${record.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 rounded-md border px-2 py-1 text-micro text-muted transition hover:text-ink"
                      >
                        详情
                      </Link>
                    </button>
                    {open && (
                      <div className="border-t bg-surface-2/40 px-4 py-3">
                        <p className="text-[13px] leading-relaxed text-ink/85">
                          {record.summary || record.info || "GH2 未提供该组件的说明。"}
                        </p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <div>
                            <p className="text-micro text-muted">输入</p>
                            <p className="mt-1 text-[12px] text-ink/80">
                              {record.inputs.map((p) => p.cn || p.name).join(" · ") || "无"}
                            </p>
                          </div>
                          <div>
                            <p className="text-micro text-muted">输出</p>
                            <p className="mt-1 text-[12px] text-ink/80">
                              {record.outputs.map((p) => p.cn || p.name).join(" · ") || "无"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {state.unknown.length > 0 && (
            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4">
              <p className="text-[13.5px] font-medium">以下名称没有对应到已收录的原生组件</p>
              <p className="mt-1 text-micro text-muted">
                多半是 GH1 旧组件、插件组件，或 GH2 的「参数」对象。可以按名字去组件库确认。
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {state.unknown.map((name) => (
                  <Link
                    key={name}
                    to={`/library?q=${encodeURIComponent(name)}`}
                    className="inline-flex items-center gap-1 rounded-full border bg-surface px-2.5 py-1 text-[11.5px] text-muted transition hover:text-ink"
                  >
                    <Search size={10} /> {name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <details className="mt-10 rounded-xl border bg-surface p-4">
        <summary className="flex cursor-pointer items-center gap-1.5 text-[13.5px] font-medium">
          <Info size={14} className="text-muted" /> 识别原理与限制（建议看一眼）
        </summary>
        <div className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed text-muted">
          <p>
            <strong className="text-ink/80">.ghx</strong>：Grasshopper 1 的画布是 XML 文本，GH2 也能读。
            站内直接读文件里的组件名与 GUID，逐个对照组件库，准确率最高。
          </p>
          <p>
            <strong className="text-ink/80">.gh2</strong>：GH2 的画布是 GHIO 二进制归档，复制到剪贴板的内容同样是二进制，
            浏览器的剪贴板接口通常拿不到明文。站内的做法是在二进制里按 UTF-8 与 UTF-16 扫描组件名和 GUID，
            能识别「用了哪些组件」，但还原不了连线与参数值。
          </p>
          <p>
            <strong className="text-ink/80">拖拽</strong>：浏览器只会把拖拽中的文件或文本交给页面。
            如果你从 GH2 拖出的是图片，页面上不会得到组件信息——这时请改用「另存为 .ghx 再拖入」。
          </p>
          <p>
            <strong className="text-ink/80">未收录</strong>：GH1 专有组件、第三方插件、以及 GH2 的参数对象（点、数值、滑块、Panel）
            不在原生组件库里，识别不到属于正常。
          </p>
        </div>
      </details>
    </div>
  );
}
