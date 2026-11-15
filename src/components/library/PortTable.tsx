import type { PortRecord } from "@/lib/types";
import { ACCESS_LABEL, REQUIREMENT_LABEL, cn, isHiddenPort, portStyle, typeCn } from "@/lib/utils";

interface Props {
  ports: PortRecord[];
  side: "input" | "output";
}

export function PortTable({ ports, side }: Props) {
  if (!ports.length) {
    return (
      <p className="rounded-lg border border-dashed px-3 py-6 text-center text-small text-muted">
        {side === "input" ? "这个组件没有输入端口。" : "这个组件没有输出端口。"}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {ports.map((port, i) => {
        const style = portStyle(port.type);
        const hidden = isHiddenPort(port.type);
        const name = port.name || (side === "input" ? `未命名输入 ${i + 1}` : `未命名输出 ${i + 1}`);
        return (
          <li key={`${port.name}-${i}`} className="rounded-lg border bg-surface p-3">
            <div className="flex items-start gap-2">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", style.dot)} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-[13.5px] font-medium">{port.cn || name}</span>
                  {port.nick && (
                    <span className="rounded bg-surface-2 px-1 font-mono text-[10px] text-muted">{port.nick}</span>
                  )}
                  <span className={cn("rounded px-1.5 text-[10px]", style.chip)}>{typeCn(port.type)}</span>
                  {hidden && (
                    <span className="rounded bg-surface-2 px-1.5 text-[10px] text-muted">隐藏</span>
                  )}
                </div>
                {port.cn && <p className="mt-0.5 font-mono text-[10.5px] text-muted/80">{name}</p>}
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                  {port.infoCn || port.info || "GH2 未提供该端口的说明。"}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10.5px] text-muted/80">
                  <span>数据结构：{ACCESS_LABEL[port.access ?? ""] ?? "未标注"}</span>
                  {side === "input" && (
                    <span>必填性：{REQUIREMENT_LABEL[port.requirement ?? ""] ?? "未标注"}</span>
                  )}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
