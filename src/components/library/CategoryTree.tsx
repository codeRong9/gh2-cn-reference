import { useMemo, useState } from "react";
import { ChevronRight, Layers } from "lucide-react";
import type { LibNode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  libs: LibNode[];
  activeLib: string | null;
  activeSection: string | null;
  onSelectLib: (lib: string | null) => void;
  onSelectSection: (section: string | null) => void;
}

export function CategoryTree({ libs, activeLib, activeSection, onSelectLib, onSelectSection }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    activeLib ? { [activeLib]: true } : {},
  );

  const total = useMemo(() => libs.reduce((s, l) => s + l.count, 0), [libs]);

  const toggle = (lib: string) => {
    setOpen((prev) => ({ ...prev, [lib]: !prev[lib] }));
    onSelectLib(lib);
    onSelectSection(null);
  };

  return (
    <nav aria-label="组件分类" className="text-[13.5px]">
      <button
        onClick={() => {
          onSelectLib(null);
          onSelectSection(null);
        }}
        className={cn(
          "mb-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition",
          !activeLib ? "bg-accent/10 font-medium text-accent" : "text-muted hover:bg-surface-2 hover:text-ink",
        )}
      >
        <Layers size={14} />
        全部组件
        <span className="ml-auto text-micro tabular-nums opacity-70">{total}</span>
      </button>

      <ul className="space-y-0.5">
        {libs.map((lib) => {
          const isActive = activeLib === lib.lib;
          const isOpen = open[lib.lib] ?? isActive;
          const sections = Object.values(lib.sections).sort((a, b) => b.count - a.count);
          return (
            <li key={lib.lib}>
              <button
                onClick={() => toggle(lib.lib)}
                aria-expanded={isOpen}
                className={cn(
                  "flex w-full items-center gap-1.5 rounded-lg px-2.5 py-2 text-left transition",
                  isActive ? "bg-surface-2 font-medium text-ink" : "text-muted hover:bg-surface-2/70 hover:text-ink",
                )}
              >
                <ChevronRight
                  size={13}
                  className={cn("shrink-0 transition-transform", isOpen && "rotate-90", !isOpen && "opacity-40")}
                />
                <span className="truncate">{lib.cn}</span>
                <span className="ml-auto text-micro tabular-nums opacity-60">{lib.count}</span>
              </button>

              {isOpen && (
                <ul className="mb-1 ml-[13px] mt-0.5 space-y-0.5 border-l pl-2">
                  {sections.map((section) => {
                    const key = section.name;
                    const active = activeLib === lib.lib && activeSection === key;
                    return (
                      <li key={key}>
                        <button
                          onClick={() => {
                            onSelectLib(lib.lib);
                            onSelectSection(key);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] transition",
                            active ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-2/60 hover:text-ink",
                          )}
                        >
                          <span className="truncate">{section.cn || section.name}</span>
                          <span className="ml-auto text-[10px] tabular-nums opacity-50">{section.count}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
