import { Link } from "react-router-dom";
import { Github, Languages, Megaphone, MessageSquarePlus, Puzzle } from "lucide-react";
import { showAnnouncement } from "./AnnouncementBar";

const REPO = "https://github.com/codeRong9/gh2-cn-reference";
const QQ = "1104824684";

export function Footer() {
  return (
    <footer className="mt-20 border-t bg-surface/60">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-[14px] font-semibold">GH2 中文操作库</p>
          <p className="mt-2 max-w-[42ch] text-small leading-relaxed text-muted">
            把 Grasshopper 2 的每一个原生组件翻译成人话：它做什么、每个端口吃什么、怎么连、什么时候用。
            面向零基础，也够老手查细节。
          </p>
          <p className="mt-4 text-micro leading-relaxed text-muted/80">
            非官方社区学习工具，与 Robert McNeel &amp; Associates 无隶属或背书关系。
            组件数据与图标取自本机 Grasshopper 2（Rhino 9）内置程序集，版权归原权利方，仅用于学习与识别。
          </p>
        </div>
        <div>
          <p className="text-micro font-medium uppercase tracking-widest text-muted">学习</p>
          <ul className="mt-3 space-y-2 text-small text-muted">
            <li><Link className="link-underline hover:text-ink" to="/learn">四站式入门路径</Link></li>
            <li><Link className="link-underline hover:text-ink" to="/recipes">常用组合配方</Link></li>
            <li><Link className="link-underline hover:text-ink" to="/glossary">中英术语表</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-micro font-medium uppercase tracking-widest text-muted">工具</p>
          <ul className="mt-3 space-y-2 text-small text-muted">
            <li><Link className="link-underline hover:text-ink" to="/library">全量组件速查</Link></li>
            <li><Link className="link-underline hover:text-ink" to="/identify">画布识别台</Link></li>
            <li><Link className="link-underline hover:text-ink" to="/about">数据来源与更正</Link></li>
          </ul>
        </div>
      </div>
      <section className="border-t bg-accent/[0.04]" aria-labelledby="footer-notice">
        <div className="mx-auto max-w-[1320px] px-4 py-7 sm:px-6">
          <h2 id="footer-notice" className="flex items-center gap-2 text-[14px] font-semibold">
            <Puzzle size={15} className="text-accent" />
            缺组件 / 想加插件翻译？请告诉我们
          </h2>
          <p className="mt-2 max-w-[86ch] text-small leading-[1.85] text-muted">
            本站目前覆盖 GH2 原生组件、参数对象与核心工具。
            <strong className="font-medium text-ink/85">第三方插件</strong>、以及 GH2 后续版本新增的电池还没有收录；
            如果这里有你要用的电池没出现，或者某条释义与软件实际行为不符，欢迎直接反馈——我们会按需求优先补。
          </p>
          <p className="mt-1.5 max-w-[86ch] text-small leading-[1.85] text-muted">
            站点以中文为主，但如果你的母语不是中文、希望补充其它语言版本或发现术语翻译有歧义，同样欢迎反馈，
            我们更希望术语与官方说明保持一致，而不是各译一套。
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <a
              href={`${REPO}/issues/new?template=identify-issue.yml`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-small text-ink transition hover:border-accent/45 hover:bg-accent/[0.06]"
            >
              <MessageSquarePlus size={13} /> 反馈缺少的组件
            </a>
            <a
              href={`${REPO}/issues/new?template=content-correction.yml`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-small text-ink transition hover:border-accent/45 hover:bg-accent/[0.06]"
            >
              <Languages size={13} /> 释义 / 术语纠错
            </a>
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-small text-muted transition hover:text-ink"
            >
              <Github size={13} /> GitHub 仓库
            </a>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-1.5 text-small text-muted">
              论坛 Q 群 <span className="mono text-ink">{QQ}</span>
            </span>
            <button
              type="button"
              onClick={showAnnouncement}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-small text-muted transition hover:text-ink"
            >
              <Megaphone size={13} /> 重新显示顶部公告
            </button>
          </div>
        </div>
      </section>

      <div className="border-t py-4 text-center text-micro text-muted/70">
        © {new Date().getFullYear()} GH2 中文操作库 · 组件说明译自 Grasshopper 2 内置帮助
      </div>
    </footer>
  );
}
