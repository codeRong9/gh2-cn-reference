import { cn, portStyle, typeCn, isHiddenPort } from "@/lib/utils";

export function PortChip({ type, className }: { type: string; className?: string }) {
  const style = portStyle(type);
  const hidden = isHiddenPort(type);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-micro font-medium",
        style.chip,
        className,
      )}
      title={hidden ? "隐藏参数：画布上默认折叠" : `${type} · ${typeCn(type)}`}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {typeCn(type)}
    </span>
  );
}
