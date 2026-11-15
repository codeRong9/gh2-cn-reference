const INPUTS = [
  { label: "3.0", tone: "bg-sky-500" },
  { label: "4.5", tone: "bg-sky-500" },
];

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[380px]">
      <div className="absolute -inset-8 rounded-[28px] border border-line/70 bg-surface-2/40 blueprint" />
      <div className="relative">
        <div className="mb-2 flex items-center justify-between px-1 text-micro uppercase tracking-[0.14em] text-muted">
          <span>Canvas</span>
          <span className="font-mono">GH2</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex w-[86px] shrink-0 flex-col gap-3">
            {INPUTS.map((input, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-[2px] ${input.tone}`} />
                <span className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px]">
                  {input.label}
                </span>
              </div>
            ))}
          </div>

          <svg width="26" height="60" viewBox="0 0 26 60" className="shrink-0" aria-hidden="true">
            <path d="M0 12 H10 V30 H26" stroke="rgb(var(--muted) / .45)" strokeWidth="1.2" fill="none" />
            <path d="M0 46 H10 V30" stroke="rgb(var(--muted) / .45)" strokeWidth="1.2" fill="none" />
          </svg>

          <div className="flex-1 overflow-hidden rounded-[10px] border bg-surface shadow-lift">
            <div className="flex items-center gap-2 border-b bg-surface-2/60 px-2.5 py-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] border border-line bg-surface font-mono text-[11px] font-semibold">
                +
              </span>
              <span className="font-mono text-[11px] tracking-tight">Addition</span>
              <span className="ml-auto text-[10px] text-muted">Maths</span>
            </div>
            <div className="space-y-1.5 px-2.5 py-2">
              {[
                { name: "Operand A", dot: "bg-sky-500" },
                { name: "Operand B", dot: "bg-sky-500" },
              ].map((port) => (
                <div key={port.name} className="flex items-center gap-2 text-[11px] text-muted">
                  <span className={`h-1.5 w-1.5 rounded-full ${port.dot}`} />
                  {port.name}
                </div>
              ))}
              <div className="mt-1 flex items-center justify-end gap-2 border-t pt-1.5 text-[11px]">
                结果
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              </div>
            </div>
          </div>

          <svg width="22" height="60" viewBox="0 0 22 60" className="shrink-0" aria-hidden="true">
            <path d="M0 30 H22" stroke="rgb(var(--muted) / .45)" strokeWidth="1.2" fill="none" />
          </svg>

          <span className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[11px] shadow-card">
            7.5
          </span>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg border border-accent/25 bg-accent/[0.06] px-3 py-2">
          <span className="mt-0.5 text-[10px] font-semibold text-accent">中文</span>
          <p className="text-[12.5px] leading-relaxed text-ink/80">
            加法：把接入的所有数值逐项相加。两个输入都接受列表，默认按最短列表匹配。
          </p>
        </div>
      </div>
    </div>
  );
}
