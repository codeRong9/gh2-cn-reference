"""导出各库英文源清单（供人工翻译时逐条对照）。"""

import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw" / "gh2.raw.json"
OUT = ROOT / "tools" / "content" / "_source"

LIBS = ["maths", "data", "vector", "curve", "surface", "mesh", "transform",
        "intersect", "display", "text", "meta", "annotation", "script"]

comps = json.loads(RAW.read_text(encoding="utf-8"))["components"]
OUT.mkdir(parents=True, exist_ok=True)

for lib in LIBS:
    rows = [c for c in comps if c["lib"] == lib]
    lines = []
    for c in rows:
        info = (c["info"] or "").replace("\n", " ").strip()
        lines.append(f"{c['id']}\t{c['name']}\t{info}")
    (OUT / f"{lib}.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"{lib}\t{len(rows)}")
