import { X } from "lucide-react";

/** 论坛 Q 群，改动只需动这里 */
export const QQ_GROUP = "1104824684";

/**
 * 顶部公告条：位于固定导航之上，可关闭。
 * 关闭后 AppShell 会把导航与正文整体上移，不留空档。
 */
export function AnnouncementBar({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] border-b border-accent/25 bg-accent/[0.08] backdrop-blur-md">
      <div className="mx-auto flex h-9 max-w-[1320px] items-center gap-2 px-4 sm:px-6">
        <span className="shrink-0 text-[13px] leading-none" aria-hidden="true">
          📢
        </span>
        <p className="min-w-0 flex-1 truncate text-[12.5px] leading-none text-ink/80">
          更多资讯及交流反馈请添加论坛 Q 群：
          <span className="mono ml-0.5 text-[13px] font-semibold tracking-wide text-accent">
            {QQ_GROUP}
          </span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭公告"
          title="关闭公告"
          className="shrink-0 rounded-md p-1 text-muted transition-colors hover:bg-accent/10 hover:text-ink"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
