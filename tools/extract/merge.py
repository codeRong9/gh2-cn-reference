"""合并各库解析结果，挂上图标，产出 data/raw/gh2.raw.json 与覆盖率报告。

不收录：
  * migration 库（GH1 旧组件迁移器，不是教学材料，About 页说明即可）
  * script 库里的迁移器（MigrateGh1*）
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
ICONS = ROOT.parent / "icons" / "svg2"
PROJECT = ROOT.parent.parent
OUT_DIR = PROJECT / "data" / "raw"

LIBS = [
    ("maths", "G2MathsComponents", "数学"),
    ("data", "G2DataComponents", "数据"),
    ("vector", "G2VectorComponents", "向量"),
    ("curve", "G2CurveComponents", "曲线"),
    ("surface", "G2SurfaceComponents", "曲面"),
    ("mesh", "G2MeshComponents", "网格"),
    ("transform", "G2TransformComponents", "变换"),
    ("intersect", "G2IntersectComponents", "相交"),
    ("display", "G2DisplayComponents", "显示"),
    ("text", "G2TextComponents", "文本"),
    ("meta", "G2MetaComponents", "元组件"),
    ("annotation", "G2AnnotationComponents", "标注"),
    ("script", "G2ScriptComponents", "脚本"),
]

EXCLUDE_TYPES = {
    "script": {"MigrateGh1ComponentCSharp", "MigrateGh1ComponentPython3", "MigrateGh1ComponentIronPython2",
               "MigrateGh1ComponentGeneric"},
}


def slugify(name: str) -> str:
    s = re.sub(r"(?<!^)(?=[A-Z])", "-", name).lower()
    return re.sub(r"[^a-z0-9\-]+", "-", s).strip("-")


def load_icon_index(lib_dir: Path) -> dict[str, str]:
    f = lib_dir / "_index.json"
    if not f.exists():
        return {}
    return json.loads(f.read_text(encoding="utf-8"))


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    records = []
    report = {"libs": [], "missingNomen": [], "missingPorts": [], "noIcon": []}
    seen_ids = Counter()
    for lib_key, asm, cn in LIBS:
        src = RAW / f"{lib_key}.json"
        if not src.exists():
            continue
        items = json.loads(src.read_text(encoding="utf-8"))
        skip = EXCLUDE_TYPES.get(lib_key, set())
        items = [it for it in items if it["typeName"] not in skip]

        icon_index = load_icon_index(ICONS / asm)
        # 运算符等图标注册在 Grasshopper2.dll 自带的图标集里，作为第二优先来源
        shared_index = {
            k: f"Grasshopper2/{v}" for k, v in load_icon_index(ICONS / "Grasshopper2").items()
        }
        by_simple: dict[str, str] = {}
        for key, fname in shared_index.items():
            by_simple.setdefault(key.split(".")[-1], fname)
        for key, fname in icon_index.items():
            by_simple[key.split(".")[-1]] = f"{asm}/{fname}"
        tail_index = {k.split(".")[-1].lower(): v for k, v in shared_index.items()}
        tail_index.update({k.split(".")[-1].lower(): f"{asm}/{v}" for k, v in icon_index.items()})

        matched = 0
        for it in items:
            type_name = it["typeName"]
            icon_key = it.get("iconKey")
            icon_file = None
            for cand in (icon_key, type_name):
                if cand and cand in by_simple:
                    icon_file = by_simple[cand]
                    break
            if icon_file is None:
                icon_file = tail_index.get((icon_key or "").lower()) or tail_index.get(type_name.lower())
            if icon_file:
                matched += 1
            else:
                report["noIcon"].append(f"{lib_key}/{type_name}")

            nomen = it.get("nomen") or {}
            base_id = f"{lib_key}.{slugify(type_name)}"
            seen_ids[base_id] += 1
            rec_id = base_id if seen_ids[base_id] == 1 else f"{base_id}-{seen_ids[base_id]}"
            records.append(
                {
                    "id": rec_id,
                    "lib": lib_key,
                    "libCn": cn,
                    "assembly": asm,
                    "namespace": it.get("namespace", ""),
                    "typeName": type_name,
                    "fullTypeName": it.get("fullTypeName", ""),
                    "guid": it.get("guid"),
                    "author": it.get("author"),
                    "name": nomen.get("name") or type_name,
                    "info": nomen.get("info", ""),
                    "chapter": nomen.get("chapter", ""),
                    "section": nomen.get("section", ""),
                    "slot": nomen.get("slot"),
                    "rank": nomen.get("rank"),
                    "sortKey": nomen.get("sortKey"),
                    "iconKey": icon_key,
                    "icon": f"icons/{icon_file}" if icon_file else None,
                    "inputs": it.get("inputs", []),
                    "outputs": it.get("outputs", []),
                    "resolve": it.get("resolve", {}),
                }
            )
            if not nomen:
                report["missingNomen"].append(f"{lib_key}/{type_name}")
            if not it.get("inputs") and not it.get("outputs"):
                report["missingPorts"].append(f"{lib_key}/{type_name}")
        report["libs"].append(
            {
                "lib": lib_key,
                "libCn": cn,
                "components": len(items),
                "iconsMatched": matched,
                "iconTotal": len(icon_index),
            }
        )

    payload = {
        "meta": {
            "source": "Grasshopper 2 (Rhino 9) built-in component assemblies",
            "sourcePath": r"D:\RHINO\RHINO 9\Plug-ins\Grasshopper2\net8.0\Components",
            "componentCount": len(records),
            "libCount": len(report["libs"]),
            "excluded": ["migration 库（GH1 旧组件迁移器）", "script 库中的 MigrateGh1* 迁移器"],
        },
        "components": records,
    }
    out = OUT_DIR / "gh2.raw.json"
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")

    total = len(records)
    with_icon = sum(1 for r in records if r["icon"])
    report["summary"] = {
        "components": total,
        "withIcon": with_icon,
        "iconRate": round(with_icon / total * 100, 1) if total else 0,
        "missingNomen": len(report["missingNomen"]),
        "missingPorts": len(report["missingPorts"]),
        "chapters": len({(r["chapter"], r["section"]) for r in records}),
        "totalPorts": sum(len(r["inputs"]) + len(r["outputs"]) for r in records),
    }
    (ROOT / "reports").mkdir(exist_ok=True)
    (ROOT / "reports" / "coverage.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    print(json.dumps(report["summary"], ensure_ascii=False, indent=1))
    print(f"output={out} size={out.stat().st_size/1024:.0f}KB")
    print("libs:", ", ".join(f"{l['lib']}={l['components']}" for l in report["libs"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
