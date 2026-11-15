"""提取 Grasshopper2.dll 里的「核心组件」（Util / Standard 面板里的电池）。

和参数对象的区别：这些类直接继承 `Component`，会出现在 GH2 的工具面板里
（例如 Cluster 簇、Chain 链、Data Dam 延时、Read/Write Text File、Read 3dm…）。
它们的名字与章节同样来自 Nomen，GUID 来自 [IoId]，与组件库的其它成员完全一致。

产物：tools/extract/raw/core.json（merge.py 直接消费）

用法：
  python tools/extract/parse_core.py --inspect   # 先看清单与章节，不写文件
  python tools/extract/parse_core.py             # 写 raw/core.json
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import parse_components as pc  # noqa: E402
import parse_params as pp  # noqa: E402

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent
DECOMPILED = ROOT / "decompiled"
RAW = ROOT / "raw"
EXE = ROOT / "Gh2Decomp" / "bin" / "Release" / "net10.0" / "Gh2Decomp.exe"
GH2 = Path(r"D:\RHINO\RHINO 9\Plug-ins\Grasshopper2\net8.0\Grasshopper2.dll")
OUT_CS = DECOMPILED / "Grasshopper2.Core.cs"

# 只收真正出现在面板里的章节，调试/示例类（chapter 为空或 Debug）排除
KEEP_CHAPTERS = {"Util", "Params", "Maths", "Data", "Vector", "Curve", "Surface", "Mesh",
                 "Transform", "Intersect", "Display", "Text", "Meta", "Annotation", "Script"}


def run(args: list[str]) -> str:
    result = subprocess.run([str(EXE), args[0], str(GH2), *args[1:]],
                            capture_output=True, text=True, encoding="utf-8", errors="replace")
    if result.returncode != 0:
        raise SystemExit(result.stderr[-1500:] or "反编译失败")
    return result.stdout


def candidates() -> list[str]:
    listing = run(["list-comp"])
    names = []
    for line in listing.splitlines():
        parts = line.rstrip().split("\t")
        if len(parts) < 2 or not parts[0].strip():
            continue
        names.append(parts[0].strip())
    return sorted(set(names))


def main() -> int:
    names = candidates()
    print(f"候选组件类型 {len(names)} 个", flush=True)
    DECOMPILED.mkdir(parents=True, exist_ok=True)
    chunks = []
    for i in range(0, len(names), 10):
        chunks.append(run(["type", *names[i : i + 10]]))
    OUT_CS.write_text("\n".join(chunks), encoding="utf-8")

    classes, order = pc.parse_file(OUT_CS)
    rows = []
    for key in order:
        blk = classes[key]
        if blk.is_abstract or not blk.base.endswith("Component"):
            continue
        nomen = pp.pick_nomen(blk.body, blk.name)
        if not nomen:
            continue
        rows.append({
            "key": key,
            "typeName": blk.name,
            "base": blk.base,
            "guid": blk.guid,
            "author": blk.author,
            "iconKey": blk.icon_key,
            "nomen": nomen,
            "inputs": [p.__dict__ for p in blk.inputs],
            "outputs": [p.__dict__ for p in blk.outputs],
        })

    for row in rows:
        n = row["nomen"]
        print(f"  {n['chapter']:<10} {n['section']:<12} {n['name']:<32} {row['typeName']}")

    kept = [r for r in rows if r["nomen"]["chapter"] in KEEP_CHAPTERS]
    print(f"共 {len(rows)} 个，按章节保留 {len(kept)} 个", flush=True)
    if "--inspect" in sys.argv:
        return 0

    records = []
    for row in kept:
        records.append({
            "lib": "core",
            "assembly": "Grasshopper2",
            "namespace": row["key"].rsplit(".", 1)[0],
            "typeName": row["typeName"],
            "fullTypeName": row["key"],
            "guid": row["guid"],
            "author": row["author"],
            "iconKey": row["iconKey"],
            "nomen": row["nomen"],
            "inputs": row["inputs"],
            "outputs": row["outputs"],
        })

    RAW.mkdir(parents=True, exist_ok=True)
    out = RAW / "core.json"
    out.write_text(json.dumps(records, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"输出 {out}（{len(records)} 个）")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
