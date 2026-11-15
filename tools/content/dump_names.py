"""导出「id + 英文名」的紧凑清单，用于补齐剩余库的中文速查。"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw" / "gh2.raw.json"
OUT = ROOT / "tools" / "content" / "_source"

comps = json.loads(RAW.read_text(encoding="utf-8"))["components"]
for lib in ["mesh", "display", "text", "meta", "annotation", "script"]:
    rows = [c for c in comps if c["lib"] == lib]
    text = "\n".join(f"{c['id']} | {c['name']}" for c in rows) + "\n"
    (OUT / f"{lib}-names.txt").write_text(text, encoding="utf-8")
    print(lib, len(rows))
