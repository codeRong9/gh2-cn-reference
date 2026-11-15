import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { LESSONS } from "@/data/learn";

const STATION_META: Record<string, { title: string; desc: string }> = {
  "01": { title: "先看见", desc: "画布、组件、端口、连线：建立第一层直觉。" },
  "02": { title: "再理解", desc: "数据形态与匹配规则：读懂 GH2 的行为方式。" },
  "03": { title: "认组件", desc: "按用途分组认识高频组件，而不是按字母表。" },
  "04": { title: "做出来", desc: "组织流程、排查问题，把定义跑通。" },
};

export default function Learn() {
  const stations = ["01", "02", "03", "04"];

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6">
      <p className="text-micro uppercase tracking-[0.18em] text-muted">Learning Path</p>
      <h1 className="mt-2 text-h1 font-semibold">四站式入门路径</h1>
      <p className="mt-3 max-w-[62ch] text-body leading-relaxed text-muted">
        不按软件菜单顺序讲，按「你需要先知道什么」讲。每一站都可以单独看，但连着看最省力：
        先用第一站建立直觉，再用第二站解释行为，第三站认组件，第四站把东西做出来。
      </p>

      <div className="mt-10 space-y-10">
        {stations.map((no) => {
          const meta = STATION_META[no];
          const lessons = LESSONS.filter((l) => l.station === no);
          return (
            <section key={no}>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[13px] text-accent">STATION {no}</span>
                <h2 className="text-h2 font-semibold">{meta.title}</h2>
              </div>
              <p className="mt-1.5 text-small text-muted">{meta.desc}</p>

              <div className="mt-4 divide-y overflow-hidden rounded-xl border bg-surface">
                {lessons.map((lesson) => (
                  <Link
                    key={lesson.slug}
                    to={`/learn/${lesson.slug}`}
                    className="group flex items-start gap-4 px-4 py-4 transition hover:bg-surface-2/60"
                  >
                    <span className="mt-0.5 font-mono text-[12px] text-muted/70">{lesson.no}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium">{lesson.title}</span>
                      <span className="mt-1 block text-small text-muted">{lesson.subtitle}</span>
                    </span>
                    <span className="mt-1 flex shrink-0 items-center gap-1 text-micro text-muted">
                      <Clock size={11} /> {lesson.minutes}
                    </span>
                    <ArrowRight
                      size={15}
                      className="mt-1 shrink-0 text-muted/50 transition group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-12 rounded-xl border border-accent/25 bg-accent/[0.05] p-5">
        <h2 className="text-[15px] font-medium">看完还想练手？</h2>
        <p className="mt-1.5 text-small leading-relaxed text-muted">
          去「配方」页挑一个组合照着搭，或者把手上任意一张画布拖进「识别台」，让站内逐条翻译它用到的组件。
        </p>
        <div className="mt-3 flex gap-2">
          <Link to="/recipes" className="rounded-lg border bg-surface px-3 py-1.5 text-small transition hover:border-accent/40">
            常用配方
          </Link>
          <Link to="/identify" className="rounded-lg border bg-surface px-3 py-1.5 text-small transition hover:border-accent/40">
            识别台
          </Link>
        </div>
      </div>
    </div>
  );
}
