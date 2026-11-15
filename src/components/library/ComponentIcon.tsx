import { useState } from "react";
import { asset, cn } from "@/lib/utils";

interface Props {
  icon?: string | null;
  name: string;
  size?: number;
  className?: string;
}

function initials(name: string) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function ComponentIcon({ icon, name, size = 28, className }: Props) {
  const [broken, setBroken] = useState(false);
  if (!icon || broken) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[6px] border border-line bg-surface-2 font-mono text-[10px] font-semibold text-muted",
          className,
        )}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
    );
  }
  return (
    <img
      src={asset(icon)}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className={cn("shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    />
  );
}
