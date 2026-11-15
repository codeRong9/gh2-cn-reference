import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({ value, label = "复制", className }: { value: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard
          .writeText(value)
          .then(() => {
            setDone(true);
            window.setTimeout(() => setDone(false), 1400);
          })
          .catch((err) => console.error(err));
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-micro text-muted transition hover:text-ink",
        className,
      )}
    >
      {done ? <Check size={11} className="text-accent" /> : <Copy size={11} />}
      {done ? "已复制" : label}
    </button>
  );
}
