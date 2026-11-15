"""从 ILSpy 反编译出的 C# 文本里解析 GH2 组件元数据。

真值来源：D:\\RHINO\\RHINO 9\\Plug-ins\\Grasshopper2\\net8.0\\Components\\G2*Components.rhp
反编译产物：tools/extract/decompiled/*.cs（每个库一个文件）

关键点：
  * 同一程序集里存在**同名不同命名空间**的类（如 Maths.SineFunction 与 Maths.Functions.SineFunction），
    因此类必须以 "命名空间.类名" 作键；
  * 抽象基类（EuclideanTrigComponent 等）不是组件，必须排除；
  * Nomen 参数给出 name/info/chapter/section/slot/rank；
  * AddInputs / AddOutputs 体内的 inputs.AddXxx("名", "别名", "说明", ...) 给出端口，
    方法名后缀即端口类型；数字强转 (Access)0 -> Item / 1 -> Twig / 2 -> Tree。
"""

from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DECOMPILED = ROOT / "decompiled"
OUT = ROOT / "raw"

LIB_ORDER = [
    "G2MathsComponents",
    "G2DataComponents",
    "G2VectorComponents",
    "G2CurveComponents",
    "G2SurfaceComponents",
    "G2MeshComponents",
    "G2TransformComponents",
    "G2IntersectComponents",
    "G2DisplayComponents",
    "G2TextComponents",
    "G2MetaComponents",
    "G2AnnotationComponents",
    "G2ScriptComponents",
    "G2MigrationComponents",
]

LIB_LABEL = {
    "G2MathsComponents": "maths",
    "G2DataComponents": "data",
    "G2VectorComponents": "vector",
    "G2CurveComponents": "curve",
    "G2SurfaceComponents": "surface",
    "G2MeshComponents": "mesh",
    "G2TransformComponents": "transform",
    "G2IntersectComponents": "intersect",
    "G2DisplayComponents": "display",
    "G2TextComponents": "text",
    "G2MetaComponents": "meta",
    "G2AnnotationComponents": "annotation",
    "G2ScriptComponents": "script",
    "G2MigrationComponents": "migration",
}

ACCESS = {0: "item", 1: "twig", 2: "tree"}
REQUIREMENT = {0: "must", 1: "may-be-null", 2: "may-be-missing"}

TYPE_MAP = {
    "AddGeneric": "Generic",
    "AddNumber": "Number",
    "AddInteger": "Integer",
    "AddBoolean": "Boolean",
    "AddText": "Text",
    "AddPoint": "Point",
    "AddVector": "Vector",
    "AddPlane": "Plane",
    "AddLine": "Line",
    "AddCircle": "Circle",
    "AddArc": "Arc",
    "AddCurve": "Curve",
    "AddPolyline": "Polyline",
    "AddSurface": "Surface",
    "AddBrep": "Brep",
    "AddMesh": "Mesh",
    "AddBox": "Box",
    "AddSphere": "Sphere",
    "AddRectangle": "Rectangle",
    "AddTransform": "Transform",
    "AddColour": "Colour",
    "AddColourStop": "Colour Stop",
    "AddComplex": "Complex",
    "AddAngle": "Angle",
    "AddInterval": "Interval",
    "AddMatrix": "Matrix",
    "AddDate": "Date",
    "AddDateTime": "DateTime",
    "AddTimeSpan": "TimeSpan",
    "AddField": "Field",
    "AddDeform": "Deform",
    "AddSite": "Site",
    "AddTriangle": "Triangle",
    "AddRegion": "Region",
    "AddCage": "Cage",
    "AddTube": "Tube",
    "AddView": "View",
    "AddTopological": "Topology",
    "AddContinuous": "Continuous",
    "AddDiscrete": "Discrete",
    "AddRandom": "Random",
    "AddTextPattern": "Text Pattern",
    "AddTuple": "Tuple",
    "AddCurveLocus": "Curve Locus",
    "AddSurfaceLocus": "Surface Locus",
    "AddFieldLocus": "Field Locus",
    "AddIGeometry": "Geometry",
    "AddGeometry": "Geometry",
    "AddHiddenPlane": "Plane",
    "AddHiddenNumber": "Number",
    "AddHiddenInteger": "Integer",
    "AddHiddenBoolean": "Boolean",
    "AddHiddenText": "Text",
    "AddHiddenVector": "Vector",
    "AddHiddenPoint": "Point",
    "AddHiddenCurve": "Curve",
    "AddEnum": "Enum",
    "AddNumberRange": "Number Range",
    "AddCoordinateSystem": "Coordinate System",
    "AddColourGradient": "Colour Gradient",
}


def find_matching(text: str, start: int, open_ch: str = "(", close_ch: str = ")") -> int:
    depth = 0
    i = start
    n = len(text)
    in_str = False
    verbatim = False
    while i < n:
        ch = text[i]
        if in_str:
            if verbatim:
                if ch == '"':
                    if i + 1 < n and text[i + 1] == '"':
                        i += 2
                        continue
                    in_str = False
            else:
                if ch == "\\":
                    i += 2
                    continue
                if ch == '"':
                    in_str = False
        else:
            if ch == "@" and i + 1 < n and text[i + 1] == '"':
                in_str = True
                verbatim = True
                i += 2
                continue
            if ch == '"':
                in_str = True
            elif ch == open_ch:
                depth += 1
            elif ch == close_ch:
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    return -1


def extract_strings(args: str) -> list[str]:
    out: list[str] = []
    i = 0
    n = len(args)
    while i < n:
        if args[i] == '"':
            j = i + 1
            buf = []
            while j < n:
                if args[j] == "\\" and j + 1 < n:
                    nxt = args[j + 1]
                    buf.append({"n": "\n", "t": "\t", "r": "\r", '"': '"', "\\": "\\"}.get(nxt, nxt))
                    j += 2
                    continue
                if args[j] == '"':
                    break
                buf.append(args[j])
                j += 1
            out.append("".join(buf))
            i = j + 1
            continue
        i += 1
    return out


def parse_enum_arg(args: str, enum_name: str) -> int | None:
    m = re.search(r"\(\s*" + enum_name + r"\s*\)\s*(\d+)", args)
    return int(m.group(1)) if m else None


@dataclass
class Port:
    name: str
    nick: str
    info: str
    type: str
    access: str | None = None
    requirement: str | None = None


@dataclass
class ClassBlock:
    key: str
    ns: str
    name: str
    base: str
    guid: str | None
    body: str
    is_abstract: bool = False
    author: str | None = None
    icon_key: str | None = None
    icon_owner: str | None = None
    nomen: dict | None = None
    inputs: list[Port] = field(default_factory=list)
    outputs: list[Port] = field(default_factory=list)
    has_add_inputs: bool = False
    has_add_outputs: bool = False


def strip_generic(name: str) -> str:
    return name.split("<")[0].strip()


def parse_port_line(call_args: str, method: str) -> Port | None:
    strings = extract_strings(call_args)
    if not strings:
        return None
    name = strings[0]
    nick = strings[1] if len(strings) > 1 else ""
    info = strings[2] if len(strings) > 2 else ""
    ptype = TYPE_MAP.get(method)
    if ptype is None:
        ptype = method[3:] if method.startswith("Add") else "Unknown"
    access_idx = parse_enum_arg(call_args, "Access")
    req_idx = parse_enum_arg(call_args, "Requirement")
    return Port(
        name=name.strip(),
        nick=nick.strip(),
        info=info.strip(),
        type=ptype,
        access=ACCESS.get(access_idx) if access_idx is not None else None,
        requirement=REQUIREMENT.get(req_idx) if req_idx is not None else None,
    )


def collect_ports(body: str, receiver: str) -> list[Port]:
    """收集端口声明。兼容 inputs.AddXxx(...) 与 inputs.RegularAdder.AddXxx(...) 两种写法。"""
    ports: list[Port] = []
    pat = re.compile(r"\.(Add\w+)(?:<[^>]*>)?\s*\(")
    for m in pat.finditer(body):
        open_idx = body.index("(", m.start())
        close_idx = find_matching(body, open_idx)
        if close_idx < 0:
            continue
        args = body[open_idx + 1 : close_idx]
        port = parse_port_line(args, m.group(1))
        if port is not None:
            ports.append(port)
    return ports


def method_body(body: str, signature_pat: str) -> str | None:
    m = re.search(signature_pat, body)
    if not m:
        return None
    brace = body.find("{", m.end())
    if brace < 0:
        return None
    end = find_matching(body, brace, "{", "}")
    if end < 0:
        return None
    return body[brace + 1 : end]


def split_top_level(raw: str) -> list[str]:
    parts: list[str] = []
    depth = 0
    buf: list[str] = []
    i = 0
    in_str = False
    while i < len(raw):
        ch = raw[i]
        if in_str:
            buf.append(ch)
            if ch == "\\" and i + 1 < len(raw):
                buf.append(raw[i + 1])
                i += 2
                continue
            if ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
                buf.append(ch)
            elif ch in "([{":
                depth += 1
                buf.append(ch)
            elif ch in ")]}":
                depth -= 1
                buf.append(ch)
            elif ch == "," and depth == 0:
                parts.append("".join(buf).strip())
                buf = []
            else:
                buf.append(ch)
        i += 1
    if buf:
        parts.append("".join(buf).strip())
    return parts


def parse_nomen(body: str) -> dict | None:
    idx = body.find("new Nomen(")
    if idx < 0:
        return None
    open_idx = body.index("(", idx)
    close_idx = find_matching(body, open_idx)
    if close_idx < 0:
        return None
    parts = split_top_level(body[open_idx + 1 : close_idx])

    def lit(p: str) -> str | None:
        s = extract_strings(p)
        return s[0] if s else None

    def num(p: str) -> int | None:
        m = re.search(r"-?\d+", p)
        return int(m.group(0)) if m else None

    if len(parts) < 2:
        return None
    name = lit(parts[0])
    if name is None:
        return None
    return {
        "name": name,
        "info": lit(parts[1]) or "",
        "chapter": lit(parts[2]) if len(parts) > 2 else "",
        "section": lit(parts[3]) if len(parts) > 3 else "",
        "slot": num(parts[4]) if len(parts) > 4 else None,
        "rank": num(parts[5]) if len(parts) > 5 else None,
        "sortKey": lit(parts[6]) if len(parts) > 6 else None,
    }


NS_RE = re.compile(r"^namespace\s+([\w\.]+)\s*;", re.M)
CLASS_RE = re.compile(
    r"^(?P<indent>\t*)(?P<mods>(?:public|internal|private|protected|static|sealed|abstract|partial|\s)+)"
    r"(?:class|struct)\s+(?P<name>\w+)\s*(?:<[^>]*>)?\s*(?::\s*(?P<bases>[^\n{]+))?\s*$",
    re.M,
)


def parse_file(path: Path) -> tuple[dict[str, ClassBlock], list[str]]:
    text = path.read_text(encoding="utf-8", errors="replace")
    ns_points = [(m.start(), m.group(1)) for m in NS_RE.finditer(text)]

    def ns_at(pos: int) -> str:
        cur = ""
        for start, name in ns_points:
            if start <= pos:
                cur = name
            else:
                break
        return cur

    classes: dict[str, ClassBlock] = {}
    order: list[str] = []
    for m in CLASS_RE.finditer(text):
        if len(m.group("indent")) > 1:
            continue  # 嵌套类型跳过
        name = m.group("name")
        base_raw = (m.group("bases") or "").strip()
        base = strip_generic(base_raw.split(",")[0]) if base_raw else ""
        brace = text.find("{", m.end())
        if brace < 0:
            continue
        end = find_matching(text, brace, "{", "}")
        if end < 0:
            continue
        body = text[brace + 1 : end]
        ns = ns_at(m.start())
        key = f"{ns}.{name}" if ns else name
        if key in classes:
            continue
        head = text[max(0, m.start() - 400) : m.start()]
        guid_m = re.findall(r'\[IoId\("([0-9a-fA-F\-]{36})"\)\]', head)
        author_m = re.findall(r'\[Author\("([^"]*)"\)\]', head)
        icon_m = re.search(
            r'IconInternal\s*=>\s*AbstractIcon\.FromResource\(\s*(?:"([^"]+)"\s*,\s*)?'
            r"(?:typeof\((\w+)\)|\(\(object\)this\)\.GetType\(\))",
            body,
        )
        blk = ClassBlock(
            key=key,
            ns=ns,
            name=name,
            base=base,
            guid=guid_m[-1] if guid_m else None,
            body=body,
            is_abstract=" abstract " in f" {m.group('mods')} ",
            author=author_m[-1] if author_m else None,
            icon_key=icon_m.group(1) if icon_m else None,
            icon_owner=icon_m.group(2) if icon_m else None,
        )
        blk.nomen = parse_nomen(body)
        blk.has_add_inputs = " AddInputs(" in body
        blk.has_add_outputs = " AddOutputs(" in body
        in_body = method_body(body, r"override\s+void\s+AddInputs\s*\(\s*[\w\.]*InputAdder\s+\w+\s*\)")
        out_body = method_body(body, r"override\s+void\s+AddOutputs\s*\(\s*[\w\.]*OutputAdder\s+\w+\s*\)")
        if in_body:
            blk.inputs = collect_ports(in_body, "inputs")
        if out_body:
            blk.outputs = collect_ports(out_body, "outputs")
        classes[key] = blk
        order.append(key)
    return classes, order


def resolve_key(ref: str, ns: str, classes: dict[str, ClassBlock]) -> str | None:
    """把基类名解析成带命名空间的键。"""
    if ref in classes:
        return ref
    parts = ns.split(".") if ns else []
    while parts:
        cand = ".".join(parts + [ref])
        if cand in classes:
            return cand
        parts.pop()
    for k in classes:
        if k.endswith("." + ref):
            return k
    return None


def resolve_chain(key: str, classes: dict[str, ClassBlock]) -> list[ClassBlock]:
    chain: list[ClassBlock] = []
    cur: str | None = key
    for _ in range(12):
        blk = classes.get(cur) if cur else None
        if blk is None:
            break
        chain.append(blk)
        nxt = resolve_key(blk.base, blk.ns, classes) if blk.base else None
        if nxt == cur:
            break
        cur = nxt
    return chain


def is_component(chain: list[ClassBlock]) -> bool:
    for blk in chain:
        if blk.base == "Component" or blk.base.endswith("Component"):
            return True
    return False


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    summary = []
    for lib in LIB_ORDER:
        path = DECOMPILED / f"{lib}.cs"
        if not path.exists():
            print(f"[skip] {lib}: decompiled file missing", file=sys.stderr)
            continue
        classes, order = parse_file(path)
        records = []
        unresolved_nomen = 0
        unresolved_ports = 0
        abstract_skipped = 0
        for key in order:
            blk = classes[key]
            chain = resolve_chain(key, classes)
            if not is_component(chain):
                continue
            if blk.is_abstract:
                abstract_skipped += 1
                continue
            nomen = next((c.nomen for c in chain if c.nomen), None)
            if nomen is None:
                m = re.search(
                    r':\s*base\(\s*"((?:[^"\\]|\\.)*)"\s*,\s*"((?:[^"\\]|\\.)*)"', blk.body
                )
                if m:
                    base_nomen = next((c.nomen for c in chain[1:] if c.nomen), None)
                    nomen = {
                        "name": m.group(1),
                        "info": m.group(2),
                        "chapter": (base_nomen or {}).get("chapter", ""),
                        "section": (base_nomen or {}).get("section", ""),
                        "slot": None,
                        "rank": None,
                        "sortKey": None,
                    }
            if nomen is None:
                unresolved_nomen += 1
            inputs = next((c.inputs for c in chain if c.has_add_inputs), [])
            outputs = next((c.outputs for c in chain if c.has_add_outputs), [])
            if not inputs and not outputs:
                unresolved_ports += 1
            icon_key = next((c.icon_key for c in chain if c.icon_key), None)
            records.append(
                {
                    "lib": LIB_LABEL[lib],
                    "assembly": lib,
                    "namespace": blk.ns,
                    "typeName": blk.name,
                    "fullTypeName": blk.key,
                    "guid": blk.guid,
                    "author": blk.author,
                    "iconKey": icon_key,
                    "nomen": nomen,
                    "inputs": [p.__dict__ for p in inputs],
                    "outputs": [p.__dict__ for p in outputs],
                    "resolve": {
                        "nomen": "il" if nomen else "failed",
                        "ports": "il" if (inputs or outputs) else "failed",
                    },
                }
            )
        out_file = OUT / f"{LIB_LABEL[lib]}.json"
        out_file.write_text(json.dumps(records, ensure_ascii=False, indent=1), encoding="utf-8")
        summary.append(
            {
                "lib": LIB_LABEL[lib],
                "classes": len(classes),
                "components": len(records),
                "abstractSkipped": abstract_skipped,
                "nomenMissing": unresolved_nomen,
                "portsMissing": unresolved_ports,
                "inputs": sum(len(r["inputs"]) for r in records),
                "outputs": sum(len(r["outputs"]) for r in records),
            }
        )
        print(
            f"{LIB_LABEL[lib]:<11} components={len(records):<4} abstract={abstract_skipped:<3} "
            f"nomen_missing={unresolved_nomen:<3} ports_missing={unresolved_ports:<3}"
        )
    (OUT / "_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"TOTAL components={sum(s['components'] for s in summary)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
