import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center px-6 py-28 text-center">
      <span className="font-mono text-[64px] font-semibold leading-none text-line">404</span>
      <h1 className="mt-4 text-h2 font-semibold">这个页面不存在</h1>
      <p className="mt-2 text-small leading-relaxed text-muted">
        链接可能已经变了。你可以回到首页，或者直接去组件库按分类找——1410 个原生组件与 83 个参数对象都在那里。
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13.5px] font-medium text-white transition hover:brightness-105 dark:text-[#0B0D10]"
        >
          <ArrowLeft size={14} /> 回首页
        </Link>
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-[13.5px] text-muted transition hover:text-ink"
        >
          <Search size={14} /> 去组件库
        </Link>
      </div>
    </div>
  );
}
