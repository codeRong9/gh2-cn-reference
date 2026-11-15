import type { PortRecord } from "@/lib/types";
import { ComponentIcon } from "./ComponentIcon";
import { cn, portStyle, typeCn } from "@/lib/utils";

interface Props {
  icon: string | null;
  name: string;
  cnName: string;
  inputs: PortRecord[];
  outputs: PortRecord[];
}

export function WiringDiagram({ icon, name, cnName, inputs, outputs }: Props) {
  return (
    <div className="rounded-xl border bg-surface-2/40 p-4">
      <div className="mb-3 flex items-center justify-between text-micro uppercase tracking-[0.14em] text-muted">
        <span>连线示意</span>
        <span className="font-mono">{inputs.length} in · {outputs.length} out</span>
      </div>

      <div className="flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
          {inputs.slice(0, 6).map((port, i) => {
            const style = portStyle(port.type);
            return (
              <div key={i} className="flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)} />
                <span className="truncate text-[11px] text-muted">{port.cn || port.name || `端口 ${i + 1}`}</span>
              </div>
            );
          })}
          {inputs.length > 6 && (
            <span className="text-[10.5px] text-muted/70">… 另有 {inputs.length - 6} 个输入</span>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center justify-center gap-1">
          <svg width="30" height="10" viewBox="0 0 30 10" aria-hidden="true">
            <path d="M0 5 H28" stroke="rgb(var(--muted) / .4)" strokeWidth="1.2" strokeDasharray="3 3" />
          </svg>
          <div className="flex w-[112px] flex-col items-center rounded-lg border bg-surface px-2 py-2 shadow-card">
            <ComponentIcon icon={icon} name={name} size={24} />
            <span className="mt-1 w-full truncate text-center text-[11px] font-medium">{cnName || name}</span>
            <span className="w-full truncate text-center font-mono text-[9.5px] text-muted">{name}</span>
          </div>
          <svg width="30" height="10" viewBox="0 0 30 10" aria-hidden="true">
            <path d="M2 5 H30" stroke="rgb(var(--muted) / .4)" strokeWidth="1.2" strokeDasharray="3 3" />
          </svg>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 text-right">
          {outputs.slice(0, 6).map((port, i) => {
            const style = portStyle(port.type);
            return (
              <div key={i} className="flex items-center justify-end gap-1.5">
                <span className="truncate text-[11px] text-muted">{port.cn || port.name || `端口 ${i + 1}`}</span>
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)} />
              </div>
            );
          })}
          {outputs.length > 6 && (
            <span className="text-[10.5px] text-muted/70">… 另有 {outputs.length - 6} 个输出</span>
          )}
        </div>
      </div>

      <p className="mt-3 border-t pt-2.5 text-[11px] leading-relaxed text-muted">
        输入从左侧接入，输出从右侧引出。颜色代表数据类型：
        {[...new Set([...inputs, ...outputs].map((p) => typeCn(p.type)))].slice(0, 4).join("、")}
        {new Set([...inputs, ...outputs].map((p) => p.type)).size > 4 ? " 等" : ""}。
        两个端口类型不一致时，GH2 会尝试一次隐式转换，失败则拒绝连接。
      </p>
    </div>
  );
}
