import { useEffect, useState, type ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { AnnouncementBar } from "./AnnouncementBar";
import { CommandPalette } from "@/components/search/CommandPalette";

const BANNER_KEY = "gh2:announcement-dismissed";
const TOPBAR_H = 60;
const BANNER_H = 36;

function readBannerOpen(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(BANNER_KEY) !== "1";
}

export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(readBannerOpen);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 把公告条高度暴露成 CSS 变量，供各页 sticky 元素对齐
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--banner-h",
      bannerOpen ? `${BANNER_H}px` : "0px",
    );
  }, [bannerOpen]);

  const dismissBanner = () => {
    setBannerOpen(false);
    window.localStorage.setItem(BANNER_KEY, "1");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {bannerOpen && <AnnouncementBar onClose={dismissBanner} />}
      <TopBar
        onOpenSearch={() => setSearchOpen(true)}
        offsetTop={bannerOpen ? BANNER_H : 0}
      />
      <main
        id="main"
        className="flex-1"
        style={{ paddingTop: (bannerOpen ? BANNER_H : 0) + TOPBAR_H }}
      >
        {children}
      </main>
      <Footer />
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
