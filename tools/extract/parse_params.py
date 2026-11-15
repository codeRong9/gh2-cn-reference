"""提取 Grasshopper2.dll 里的「参数对象」（Params 面板：Listen / Shout / 各类参数）。

为什么单独一个脚本：
  * 这些类型在 Grasshopper2.dll 本体里，不属于 Components\\G2*Components.rhp；
  * 它们继承 Parameter 而不是 Component，parse_components.py 的过滤条件会全部丢掉；
  * Listen / Shout 是 GH2 独有的「无线传值」对象，识别台必须能认出它们的 GUID。

产物：tools/extract/raw/params.json（schema 与其它库一致，merge.py 直接消费）

用法：
  python tools/extract/parse_params.py          # 全量重跑
  python tools/extract/parse_params.py --list   # 只列出候选类型
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import parse_components as pc  # noqa: E402

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent
DECOMPILED = ROOT / "decompiled"
RAW = ROOT / "raw"
EXE = ROOT / "Gh2Decomp" / "bin" / "Release" / "net10.0" / "Gh2Decomp.exe"
GH2 = Path(r"D:\RHINO\RHINO 9\Plug-ins\Grasshopper2\net8.0\Grasshopper2.dll")
OUT_CS = DECOMPILED / "Grasshopper2.Parameters.cs"

# 参数对象的基类（含中间抽象类，用来判定「这是一个参数对象」）
PARAM_BASES = {
    "Parameter",
    "GenericParameter",
    "ValueParameter",
    "NumericParameter",
    "BakeAwareParameter",
    "SpecialParameter",
}


def run(args: list[str]) -> str:
    if not EXE.exists():
        raise SystemExit(f"缺少反编译工具：{EXE}\n先执行 dotnet build -c Release（tools/extract/Gh2Decomp）")
    if not GH2.exists():
        raise SystemExit(f"找不到 Grasshopper2.dll：{GH2}")
    result = subprocess.run(
        [str(EXE), args[0], str(GH2), *args[1:]],
        capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    if result.returncode != 0:
        raise SystemExit(result.stderr[-2000:] or "反编译失败")
    return result.stdout


def candidate_types() -> list[str]:
    listing = run(["list-types", "Grasshopper2.Parameters."])
    names: list[str] = []
    for line in listing.splitlines():
        parts = line.rstrip().split("\t")
        if len(parts) < 3:
            continue
        full, nested = parts[0].strip(), parts[2].strip()
        if nested == "1":
            continue  # 嵌套类型反编译会失败，也与参数对象无关
        if "`" in full or "<" in full:
            continue  # 泛型定义
        names.append(full)
    return sorted(set(names))


def decompile(names: list[str]) -> None:
    DECOMPILED.mkdir(parents=True, exist_ok=True)
    chunks: list[str] = []
    batch = 10
    for i in range(0, len(names), batch):
        chunks.append(run(["type", *names[i : i + batch]]))
        print(f"  反编译 {min(i + batch, len(names))}/{len(names)}", flush=True)
    OUT_CS.write_text("\n".join(chunks), encoding="utf-8")


def depths(body: str) -> list[int]:
    """每个字符位置的花括号深度，用于区分「本类的 Nomen」与「嵌套类的 Nomen」。"""
    out: list[int] = []
    depth = 0
    in_str = False
    escape = False
    for ch in body:
        out.append(depth)
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
    return out


def all_nomens(body: str) -> list[tuple[int, dict]]:
    """抓出类体里所有 new Nomen(...)，并记录其花括号深度。"""
    out: list[tuple[int, dict]] = []
    depth_map = depths(body)
    idx = 0
    while True:
        hit = body.find("new Nomen(", idx)
        if hit < 0:
            break
        open_idx = body.index("(", hit)
        close_idx = pc.find_matching(body, open_idx)
        if close_idx < 0:
            break
        parts = pc.split_top_level(body[open_idx + 1 : close_idx])
        idx = close_idx
        if len(parts) < 2:
            continue
        strings = pc.extract_strings(parts[0])
        if not strings:
            continue
        num = None
        if len(parts) > 5:
            digits = "".join(ch for ch in parts[4] if ch.isdigit())
            num = int(digits) if digits else None
        out.append((depth_map[hit], {
            "name": strings[0],
            "info": (pc.extract_strings(parts[1]) or [""])[0],
            "chapter": (pc.extract_strings(parts[2]) or [""])[0] if len(parts) > 2 else "",
            "section": (pc.extract_strings(parts[3]) or [""])[0] if len(parts) > 3 else "",
            "slot": num,
            "rank": None,
            "sortKey": None,
        }))
    return out


def norm(text: str) -> str:
    return "".join(ch for ch in text.lower() if ch.isalnum())


def pick_nomen(body: str, type_name: str) -> dict | None:
    """嵌套类型（Set Related / Set Grid 等）也带 Nomen，必须挑属于本类的那一个。"""
    options = all_nomens(body)
    if not options:
        return None
    # 参数对象的 Nomen 一定挂在 Params 章；嵌套的 Set* 辅助类没有章，先排除
    palette = [option for _, option in options if option["chapter"] == "Params"]
    if palette:
        top = palette
    else:
        shallowest = min(depth for depth, _ in options)
        top = [option for depth, option in options if depth == shallowest]
    stem = norm(type_name)
    for suffix in ("object", "parameter"):
        if stem.endswith(suffix):
            stem = stem[: -len(suffix)]
    for option in top:
        if norm(option["name"]) == stem:
            return option
    return top[0]


def main() -> int:
    names = candidate_types()
    print(f"候选类型 {len(names)} 个", flush=True)
    if "--list" in sys.argv:
        print("\n".join(names))
        return 0

    decompile(names)
    classes, order = pc.parse_file(OUT_CS)

    records: list[dict] = []
    for key in order:
        blk = classes[key]
        if blk.base not in PARAM_BASES and not blk.base.endswith("Parameter"):
            continue
        nomen = pick_nomen(blk.body, blk.name)
        if not nomen:
            continue  # 抽象基类与内部辅助类没有 Nomen
        records.append({
            "lib": "params",
            "assembly": "Grasshopper2",
            "namespace": blk.ns,
            "typeName": blk.name,
            "fullTypeName": blk.key,
            "guid": blk.guid,
            "author": blk.author,
            "iconKey": blk.icon_key,
            "nomen": nomen,
            "inputs": [p.__dict__ for p in blk.inputs],
            "outputs": [p.__dict__ for p in blk.outputs],
        })

    RAW.mkdir(parents=True, exist_ok=True)
    out = RAW / "params.json"
    out.write_text(json.dumps(records, ensure_ascii=False, indent=1), encoding="utf-8")

    with_guid = sum(1 for r in records if r["guid"])
    with_info = sum(1 for r in records if r["nomen"].get("info"))
    print(json.dumps({
        "params": len(records),
        "withGuid": with_guid,
        "withInfo": with_info,
        "output": str(out),
    }, ensure_ascii=False, indent=1))
    print("名称:", ", ".join(sorted(r["nomen"]["name"] for r in records)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
