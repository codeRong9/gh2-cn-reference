import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { Logo } from "./Logo";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/learn", label: "入门" },
  { to: "/library", label: "组件库" },
  { to: "/identify", label: "识别台" },
  { to: "/recipes", label: "配方" },
  { to: "/glossary", label: "术语" },
];

export function TopBar({
  onOpenSearch,
  offsetTop = 0,
}: {
  onOpenSearch: () => void;
  /** 公告条占用的高度，导航整体下移同样的距离 */
  offsetTop?: number;
}) {
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className="fixed inset-x-0 z-50 border-b border-line/80 bg-bg/85 backdrop-blur-md"
      style={{ top: offsetTop }}
    >
      <div className="mx-auto flex h-[60px] max-w-[1320px] items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="GH2 中文操作库 首页">
          <Logo size={26} />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[14.5px] font-semibold tracking-tight">GH2 中文操作库</span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted">
              Grasshopper 2 Reference
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-2.5 py-1.5 text-[13.5px] transition-colors",
                  isActive
                    ? "bg-surface-2 font-medium text-ink"
                    : "text-muted hover:bg-surface-2/70 hover:text-ink",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={onOpenSearch}
            className="group flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-small text-muted transition hover:border-accent/40 hover:text-ink"
            aria-label="打开搜索"
          >
            <Search size={14} />
            <span className="hidden sm:inline">搜索组件</span>
            <kbd className="hidden rounded border border-line px-1 py-px text-[10px] tracking-wide sm:inline">
              Ctrl K
            </kbd>
          </button>

          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "切换到浅色主题" : "切换到深色主题"}
            className="rounded-lg border border-transparent p-2 text-muted transition hover:border-line hover:bg-surface hover:text-ink"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="打开导航菜单"
            aria-expanded={mobileOpen}
            className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-ink md:hidden"
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-surface px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-2 py-2 text-[14px]",
                  isActive ? "bg-surface-2 font-medium" : "text-muted",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
