import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BASE = import.meta.env.BASE_URL || "/";

export function asset(path: string) {
  return `${BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export type PortKind =
  | "number"
  | "boolean"
  | "text"
  | "point"
  | "vector"
  | "plane"
  | "curve"
  | "surface"
  | "mesh"
  | "transform"
  | "field"
  | "function"
  | "graph"
  | "data";

const KIND_MAP: Record<string, PortKind> = {
  Number: "number",
  Integer: "number",
  Numeric: "number",
  Index: "number",
  Angle: "number",
  Interval: "number",
  TimeSpan: "number",
  Complex: "number",
  Random: "number",
  Continuous: "number",
  Discrete: "number",
  Date: "number",
  DateTime: "number",
  Boolean: "boolean",
  Text: "text",
  "Text Pattern": "text",
  Point: "point",
  UvPoint: "point",
  NPoint: "point",
  Vector: "vector",
  Plane: "plane",
  Curve: "curve",
  Line: "curve",
  Polyline: "curve",
  Arc: "curve",
  Circle: "curve",
  Rectangle: "curve",
  Triangle: "curve",
  "Curve Locus": "curve",
  Surface: "surface",
  Brep: "surface",
  Sphere: "surface",
  Tube: "surface",
  Region: "surface",
  Cage: "surface",
  Box: "surface",
  "Surface Locus": "surface",
  Mesh: "mesh",
  MeshFacet: "mesh",
  Transform: "transform",
  Deform: "transform",
  Field: "field",
  "Field Locus": "field",
  Function: "function",
  Graph: "graph",
  Colour: "data",
  Gradient: "data",
  Enum: "data",
  HiddenEnum: "data",
  Generic: "data",
  MetaData: "data",
  MetaName: "data",
  Tuple: "data",
  View: "data",
  Site: "data",
  Path: "data",
  Guid: "data",
  Dot: "data",
};

export function portKind(type: string): PortKind {
  const clean = type.replace(/^Hidden/, "");
  return KIND_MAP[clean] ?? "data";
}

const KIND_STYLE: Record<PortKind, { dot: string; chip: string; label: string }> = {
  number: {
    dot: "bg-sky-500",
    chip: "text-sky-700 bg-sky-500/10 dark:text-sky-300",
    label: "数值",
  },
  boolean: {
    dot: "bg-amber-500",
    chip: "text-amber-700 bg-amber-500/10 dark:text-amber-300",
    label: "布尔",
  },
  text: {
    dot: "bg-violet-500",
    chip: "text-violet-700 bg-violet-500/10 dark:text-violet-300",
    label: "文本",
  },
  point: {
    dot: "bg-pink-500",
    chip: "text-pink-700 bg-pink-500/10 dark:text-pink-300",
    label: "点",
  },
  vector: {
    dot: "bg-orange-500",
    chip: "text-orange-700 bg-orange-500/10 dark:text-orange-300",
    label: "向量",
  },
  plane: {
    dot: "bg-teal-500",
    chip: "text-teal-700 bg-teal-500/10 dark:text-teal-300",
    label: "平面",
  },
  curve: {
    dot: "bg-emerald-500",
    chip: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-300",
    label: "曲线",
  },
  surface: {
    dot: "bg-indigo-500",
    chip: "text-indigo-700 bg-indigo-500/10 dark:text-indigo-300",
    label: "曲面",
  },
  mesh: {
    dot: "bg-lime-600",
    chip: "text-lime-700 bg-lime-600/10 dark:text-lime-300",
    label: "网格",
  },
  transform: {
    dot: "bg-slate-500",
    chip: "text-slate-600 bg-slate-500/10 dark:text-slate-300",
    label: "变换",
  },
  field: {
    dot: "bg-cyan-600",
    chip: "text-cyan-700 bg-cyan-600/10 dark:text-cyan-300",
    label: "场",
  },
  function: {
    dot: "bg-fuchsia-500",
    chip: "text-fuchsia-700 bg-fuchsia-500/10 dark:text-fuchsia-300",
    label: "函数",
  },
  graph: {
    dot: "bg-rose-500",
    chip: "text-rose-700 bg-rose-500/10 dark:text-rose-300",
    label: "图",
  },
  data: {
    dot: "bg-zinc-400",
    chip: "text-zinc-600 bg-zinc-400/10 dark:text-zinc-300",
    label: "数据",
  },
};

export function portStyle(type: string) {
  return KIND_STYLE[portKind(type)];
}

export const ACCESS_LABEL: Record<string, string> = {
  item: "单项",
  twig: "小枝",
  tree: "树",
};

export const REQUIREMENT_LABEL: Record<string, string> = {
  must: "必填",
  "may-be-null": "可空",
  "may-be-missing": "可缺省",
};

const TYPE_CN: Record<string, string> = {
  Number: "数值",
  Integer: "整数",
  Numeric: "数值",
  Boolean: "布尔值",
  Text: "文本",
  Point: "点",
  Vector: "向量",
  Plane: "平面",
  Curve: "曲线",
  Line: "直线",
  Polyline: "多段线",
  Arc: "圆弧",
  Circle: "圆",
  Rectangle: "矩形",
  Triangle: "三角形",
  Surface: "曲面",
  Brep: "多重曲面",
  Mesh: "网格",
  Box: "立方体",
  Sphere: "球体",
  Transform: "变换",
  Interval: "区间",
  Angle: "角度",
  Complex: "复数",
  Field: "场",
  Function: "函数",
  Graph: "图结构",
  Colour: "颜色",
  Gradient: "渐变",
  Enum: "枚举",
  Generic: "通用数据",
  MetaData: "元数据",
  Tuple: "元组",
  Index: "索引",
  DateTime: "日期时间",
  TimeSpan: "时间跨度",
  Region: "区域",
  Cage: "控制笼",
  Tube: "管",
  Deform: "形变",
  Site: "场地",
  View: "视图",
  Path: "路径",
  Random: "随机数",
  "Curve Locus": "曲线轨迹",
  "Surface Locus": "曲面轨迹",
  "Field Locus": "场轨迹",
};

export function typeCn(type: string) {
  const clean = type.replace(/^Hidden/, "");
  return TYPE_CN[clean] ?? clean;
}

export function isHiddenPort(type: string) {
  return type.startsWith("Hidden");
}
