import { Link } from "react-router-dom";

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
      <div className="border-t py-4 text-center text-micro text-muted/70">
        © {new Date().getFullYear()} GH2 中文操作库 · 组件说明译自 Grasshopper 2 内置帮助
      </div>
    </footer>
  );
}
