import { Link } from "react-router-dom";
import { Database, FileWarning, Scale, Wrench } from "lucide-react";

export default function About() {
  return (
    <div className="mx-auto max-w-[860px] px-4 py-12 sm:px-6">
      <p className="text-micro uppercase tracking-[0.18em] text-muted">About</p>
      <h1 className="mt-2 text-h1 font-semibold">这个库是怎么来的</h1>
      <p className="mt-4 text-body leading-[1.85] text-ink/85">
        这里不是又一份「组件清单截图」。整站的组件名称、章节归属、端口名称、端口说明与图标，
        都是从本机安装的 Grasshopper 2（随 Rhino 9 提供）内置组件程序集里直接读出来的——
        也就是你在 GH2 里点组件右上角小问号时看到的那份说明的原始出处。
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          {
            icon: <Database size={16} />,
            title: "数据来源",
            body: "读取 13 个原生组件库（数学 / 数据 / 向量 / 曲线 / 曲面 / 网格 / 变换 / 相交 / 显示 / 文本 / 元组件 / 标注 / 脚本）加 1 个参数库（点、数值、滑块、Panel、Listen / Shout 等参数对象）的程序集定义，共 1493 个对象、5956 个端口。",
          },
          {
            icon: <Wrench size={16} />,
            title: "提取方式",
            body: "先把程序集反编译成可读代码，再解析每个组件构造时写入的名称、章节、说明与端口声明，最后与图标资源逐一对齐，缺失项单独报告而不是猜。",
          },
          {
            icon: <FileWarning size={16} />,
            title: "未收录",
            body: "GH1 旧组件迁移器（migration 库）属于文件兼容用途、不承担教学意义，未收录。参数面板里的对象（点、数值、滑块、Panel、Listen / Shout）已单独归入「参数」库，它们的性质是参数对象而不是组件，页面里会标注清楚。",
          },
          {
            icon: <Scale size={16} />,
            title: "版权与定位",
            body: "组件说明与图标的版权归 Robert McNeel & Associates 及各组件作者，本站仅用于学习与识别，不做商业分发。这是非官方社区项目，与 McNeel 无隶属关系。",
          },
        ].map((block) => (
          <div key={block.title} className="rounded-xl border bg-surface p-5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
              {block.icon}
            </span>
            <h2 className="mt-3 text-[15px] font-medium">{block.title}</h2>
            <p className="mt-1.5 text-small leading-relaxed text-muted">{block.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 rounded-xl border bg-surface p-5">
        <h2 className="text-[15px] font-medium">中文内容是怎么写的</h2>
        <p className="mt-2 text-small leading-[1.9] text-muted">
          英文原文逐条读、再逐条译，术语统一走同一份词表（List 一律译作「列表」、Tree 译作「树」、Access 译作「数据结构」）。
          精讲部分的判断依据是 GH2 的真实行为：端口的数据结构标注（单项 / 小枝 / 树）、必填性标注、以及组件本身的说明文字，
          不凭印象补细节。凡是没把握的地方，宁可留白也不写「应该是」。
        </p>
        <p className="mt-3 text-small leading-[1.9] text-muted">
          如果你发现某条释义和 GH2 里的实际表现不符，那是我们的问题——请以软件行为为准，并告知我们更正。
        </p>
      </section>

      <section className="mt-10 rounded-xl border bg-surface p-5">
        <h2 className="text-[15px] font-medium">在线地址与反馈</h2>
        <p className="mt-2 text-small leading-[1.9] text-muted">
          公网地址：
          <a
            href="https://coderong9.github.io/gh2-cn-reference/"
            target="_blank"
            rel="noreferrer"
            className="text-accent link-underline"
          >
            coderong9.github.io/gh2-cn-reference
          </a>
          ；源码在{" "}
          <a
            href="https://github.com/codeRong9/gh2-cn-reference"
            target="_blank"
            rel="noreferrer"
            className="text-accent link-underline"
          >
            GitHub
          </a>{" "}
          公开，发现释义与 GH2 实际行为不符，可以直接提 Issue。
        </p>
        <p className="mt-1.5 text-small leading-[1.9] text-muted">
          更多资讯与交流反馈，欢迎加入论坛 Q 群{" "}
          <span className="mono text-ink">1104824684</span>。
        </p>
      </section>

      <section className="mt-10 rounded-xl border border-dashed p-5">
        <h2 className="text-[15px] font-medium">重建数据</h2>
        <p className="mt-2 text-small leading-relaxed text-muted">
          站点是纯静态的，数据用脚本从本机程序集生成：先跑 <code className="mono rounded bg-surface-2 px-1">tools/extract</code>{" "}
          里的提取与合并脚本，再跑 <code className="mono rounded bg-surface-2 px-1">tools/build/build_data.py</code>{" "}
          产出分库 JSON、检索索引与图标，最后 <code className="mono rounded bg-surface-2 px-1">npm run build</code>。
        </p>
        <Link to="/library" className="mt-4 inline-flex text-small text-accent link-underline">
          回到组件库
        </Link>
      </section>
    </div>
  );
}
