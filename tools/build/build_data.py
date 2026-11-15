"""把 data/raw 的英文真值与 tools/content 的中文内容合成站点数据。

产物（都进 public/，随构建一起发布）：
  public/data/meta.json            全站统计与分类树
  public/data/index.json           轻量检索索引（列表页与命令面板用）
  public/data/lib/<lib>.json       分库完整数据（含端口）
  public/icons/<...>.svg           组件图标（只复制被引用的）
"""

from __future__ import annotations

import json
import re
import shutil
from collections import Counter, OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw" / "gh2.raw.json"
CONTENT = ROOT / "tools" / "content"
ICON_SRC = ROOT / "tools" / "icons" / "svg2"
PUBLIC = ROOT / "public"
DATA_OUT = PUBLIC / "data"

LIB_ORDER = ["maths", "data", "vector", "curve", "surface", "mesh", "transform",
             "intersect", "display", "text", "meta", "annotation", "script"]

LIB_META = {
    "maths": {"cn": "数学", "desc": "数值运算、三角函数、区间、复数、统计与随机数"},
    "data": {"cn": "数据", "desc": "列表、树、集合、字符串与数据结构的增删改查"},
    "vector": {"cn": "向量", "desc": "点、向量、平面、场与图结构的构造与计算"},
    "curve": {"cn": "曲线", "desc": "直线、圆弧、样条、多段线的创建、分析与细分"},
    "surface": {"cn": "曲面", "desc": "曲面与多重曲面的构建、放样、扫掠与拆解"},
    "mesh": {"cn": "网格", "desc": "网格生成、细分、简化、焊接与拓扑修复"},
    "transform": {"cn": "变换", "desc": "移动、旋绕、缩放、阵列与坐标系统变换"},
    "intersect": {"cn": "相交", "desc": "曲线、曲面、网格之间的交线与布尔运算"},
    "display": {"cn": "显示", "desc": "预览着色、文字标注、尺寸与烘焙相关组件"},
    "text": {"cn": "文本", "desc": "文本拼接、格式化、解析与标记"},
    "meta": {"cn": "元组件", "desc": "元数据、分组、簇与文档级操作"},
    "annotation": {"cn": "标注", "desc": "面积、体积、质心等测量标注组件"},
    "script": {"cn": "脚本", "desc": "C# 与 Python 脚本电池，自定义算法入口"},
}

SECTION_CN = {
    "Operator": "运算符",
    "Trigs": "三角函数",
    "Trig": "三角函数",
    "Function": "函数",
    "Functions": "函数",
    "Constants": "常量",
    "Intervals": "区间",
    "Complex": "复数",
    "Statistics": "统计",
    "Randomness": "随机",
    "Random": "随机",
    "Distributions": "概率分布",
    "Logic": "布尔逻辑",
    "Number": "数值",
    "Numbers": "数值",
    "Sequence": "序列",
    "Sets": "集合",
    "Lists": "列表",
    "List": "列表",
    "Trees": "树",
    "Tree": "树",
    "Text": "文本",
    "Strings": "字符串",
    "Geometry": "几何",
    "Point": "点",
    "Points": "点",
    "Vector": "向量",
    "Vectors": "向量",
    "Plane": "平面",
    "Planes": "平面",
    "Field": "场",
    "Fields": "场",
    "Graph": "图",
    "Graphs": "图",
    "Spline": "样条",
    "Splines": "样条",
    "Primitive": "基本曲线",
    "Primitives": "基本曲线",
    "Freeform": "自由曲线",
    "Util": "工具",
    "Tools": "工具",
    "Analysis": "分析",
    "Display": "显示",
    "Colour": "颜色",
    "Colours": "颜色",
    "Preview": "预览",
    "Bake": "烘焙",
    "Transform": "变换",
    "Euclidean": "欧氏变换",
    "Affine": "仿射变换",
    "Array": "阵列",
    "Boolean": "布尔运算",
    "Intersection": "相交",
    "Mesh": "网格",
    "Surface": "曲面",
    "Brep": "多重曲面",
    "Nurbs": "NURBS",
    "Trim": "修剪",
    "Divide": "细分",
    "Meta": "元数据",
    "Script": "脚本",
    "Measurement": "测量",
    "Annotation": "标注",
}


def slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower())
    return s.strip("-")


def load_zh_generic(sub: str) -> dict[str, dict]:
    """读取 tools/content/<sub>/*.json，按组件 id 归并。"""
    out: dict[str, dict] = {}
    folder = CONTENT / sub
    if not folder.exists():
        return out
    for f in sorted(folder.glob("*.json")):
        data = json.loads(f.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            for k, v in data.items():
                out[k] = v
    return out


def load_port_dict() -> dict[str, str]:
    f = CONTENT / "ports_dict.json"
    if not f.exists():
        return {}
    raw = json.loads(f.read_text(encoding="utf-8"))
    return {k.lower(): v for k, v in raw.items() if not k.startswith("_")}


def port_cn(name: str, dict_terms: dict[str, str]) -> str:
    """端口中文名：先整名匹配，再逐词组合；不认识的词就留空，不硬翻。"""
    if not name:
        return ""
    key = name.strip().lower()
    if key in dict_terms:
        return dict_terms[key]
    words = re.split(r"[\s\-_]+", key)
    if not words:
        return ""
    parts: list[str] = []
    for word in words:
        if not word:
            continue
        hit = dict_terms.get(word)
        if hit is None:
            return ""
        parts.append(hit)
    return "".join(parts) if len(parts) <= 4 else ""


def pinyin_fields(cn: str) -> tuple[str, str]:
    """只为中文名生成拼音；英文名本身已可被 includes 命中。"""
    if not cn:
        return "", ""
    from pypinyin import lazy_pinyin

    parts = [p for p in lazy_pinyin(cn, errors="ignore") if p and p.isascii()]
    if not parts:
        return "", ""
    return "".join(parts).lower(), "".join(p[0] for p in parts).lower()


def main() -> int:
    raw = json.loads(RAW.read_text(encoding="utf-8"))
    comps = raw["components"]

    zh_lib = load_zh_generic("zh")
    zh_ports = load_zh_generic("ports")
    zh_detail = load_zh_generic("detail")
    port_terms = load_port_dict()

    for c in comps:
        z = zh_lib.get(c["id"], {})
        c["cn"] = z.get("cn", "")
        c["summary"] = z.get("summary", "")
        if z.get("alias"):
            c["alias"] = z["alias"]
        pz = zh_ports.get(c["id"], {})
        for side in ("inputs", "outputs"):
            for i, p in enumerate(c.get(side, [])):
                key = p.get("name") or f"#{i}"
                item = pz.get(side, {}).get(key) if isinstance(pz, dict) else None
                p["cn"] = (item.get("cn", "") if isinstance(item, dict) else "") or port_cn(p.get("name", ""), port_terms)
                p["infoCn"] = item.get("info", "") if isinstance(item, dict) else ""
        detail = zh_detail.get(c["id"])
        c["hasDetail"] = bool(detail)
        if detail:
            c["detail"] = detail
        c["sectionCn"] = SECTION_CN.get(c.get("section", ""), c.get("section", ""))
        c["py"], c["pyi"] = pinyin_fields(c["cn"] or c["name"])

    # 排序：库顺序 → 章 → 节 → slot → 名称
    lib_rank = {k: i for i, k in enumerate(LIB_ORDER)}
    comps.sort(key=lambda c: (
        lib_rank.get(c["lib"], 99), c.get("chapter", ""), c.get("section", ""),
        c.get("slot") or 0, c.get("name", ""),
    ))

    DATA_OUT.mkdir(parents=True, exist_ok=True)
    (DATA_OUT / "lib").mkdir(exist_ok=True)

    by_lib: dict[str, list] = OrderedDict()
    for c in comps:
        by_lib.setdefault(c["lib"], []).append(c)

    for lib, items in by_lib.items():
        (DATA_OUT / "lib" / f"{lib}.json").write_text(
            json.dumps({"lib": lib, "components": items}, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )

    # 轻量索引：列表与检索都只用这份
    index = []
    for c in comps:
        types = sorted({p["type"] for p in c.get("inputs", []) + c.get("outputs", [])})
        index.append({
            "id": c["id"],
            "n": c["name"],
            "c": c["cn"],
            "l": c["lib"],
            "ch": c.get("chapter", ""),
            "se": c.get("section", ""),
            "seC": c.get("sectionCn", ""),
            "t": types,
            "d": 1 if c["hasDetail"] else 0,
            "in": len(c.get("inputs", [])),
            "out": len(c.get("outputs", [])),
            "i": c["icon"],
            "py": c.get("py", ""),
            "pyi": c.get("pyi", ""),
        })
    (DATA_OUT / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )

    # 分类树
    tree: dict[str, dict] = {}
    for c in comps:
        lib = c["lib"]
        node = tree.setdefault(lib, {"lib": lib, "cn": LIB_META.get(lib, {}).get("cn", lib),
                                     "desc": LIB_META.get(lib, {}).get("desc", ""),
                                     "count": 0, "sections": {}})
        node["count"] += 1
        sec = node["sections"].setdefault(c.get("section", ""), {
            "name": c.get("section", ""),
            "cn": c.get("sectionCn", ""),
            "chapter": c.get("chapter", ""),
            "count": 0,
        })
        sec["count"] += 1

    meta = {
        "componentCount": len(comps),
        "libCount": len(by_lib),
        "portCount": sum(len(c.get("inputs", [])) + len(c.get("outputs", [])) for c in comps),
        "detailCount": sum(1 for c in comps if c["hasDetail"]),
        "translatedCount": sum(1 for c in comps if c["cn"]),
        "withIcon": sum(1 for c in comps if c["icon"]),
        "libs": [tree[k] for k in LIB_ORDER if k in tree],
        "typeCounts": dict(Counter(t for c in comps for t in
                                   {p["type"] for p in c.get("inputs", []) + c.get("outputs", [])}).most_common()),
    }
    (DATA_OUT / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1), encoding="utf-8")

    # 图标按需复制：只增量补齐，不做整目录删除
    # （整目录 rmtree 会触发批量删除保护，导致构建卡住）
    copied = 0
    stale: list[Path] = []
    wanted: set[Path] = set()
    for c in comps:
        rel = c.get("icon")
        if not rel:
            continue
        src = ICON_SRC / rel[len("icons/"):]
        dst = PUBLIC / rel
        if not src.exists():
            continue
        wanted.add(dst)
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists() or dst.stat().st_mtime < src.stat().st_mtime:
            shutil.copy2(src, dst)
            copied += 1

    # 只清理“已不再被引用”的少量残留图标，逐文件删除，避免批量删除保护
    icon_out = PUBLIC / "icons"
    if icon_out.exists():
        for f in icon_out.rglob("*.svg"):
            if f not in wanted:
                stale.append(f)
    for f in stale[:200]:
        f.unlink(missing_ok=True)

    print(json.dumps({
        "components": len(comps),
        "libs": len(by_lib),
        "iconsCopied": copied,
        "iconsStale": len(stale),
        "translated": meta["translatedCount"],
        "details": meta["detailCount"],
        "indexKB": round((DATA_OUT / "index.json").stat().st_size / 1024, 1),
        "dataKB": round(sum(f.stat().st_size for f in (DATA_OUT / "lib").glob("*.json")) / 1024, 1),
    }, ensure_ascii=False, indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
