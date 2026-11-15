export interface Term {
  en: string;
  cn: string;
  note: string;
}

export interface TermGroup {
  title: string;
  desc: string;
  terms: Term[];
}

export const GLOSSARY: TermGroup[] = [
  {
    title: "界面与操作",
    desc: "在画布上做任何事之前，先把这些词对上号。",
    terms: [
      { en: "Canvas", cn: "画布", note: "摆组件、连线的区域；它不是绘图区，而是数据流图。" },
      { en: "Component", cn: "组件 / 电池", note: "画布上的一个方块，负责一次运算。国内习惯叫「电池」。" },
      { en: "Parameter", cn: "参数", note: "承载数据的对象，如数值、点、曲线，可单独摆在画布上。" },
      { en: "Port", cn: "端口", note: "组件左右两侧的小方块，数据从这里进出。" },
      { en: "Wire", cn: "连线", note: "把上游输出接到下游输入的线，代表数据流动方向。" },
      { en: "Grip", cn: "手柄 / 控制点", note: "参数对象上可直接拖动的小圆点，用来改值。" },
      { en: "Preview", cn: "预览", note: "在 Rhino 视图里显示几何结果，可选择逐组件开关。" },
      { en: "Bake", cn: "烘焙", note: "把 GH2 里的几何正式写入 Rhino 文档，成为可编辑对象。" },
      { en: "Cluster", cn: "簇", note: "把一组组件打包成自己的组件，对外只暴露必要端口。" },
      { en: "Definition", cn: "定义", note: "整张画布保存成的文件，扩展名 .ghx / .gh2。" },
      { en: "Document", cn: "文档", note: "GH2 里承载定义与对象的容器，也指 Rhino 文档。" },
      { en: "Solver", cn: "求解器", note: "负责按依赖顺序重算整张画布的引擎。" },
    ],
  },
  {
    title: "数据结构",
    desc: "GH2 里 90% 的「结果不对」都出在这一组词上。",
    terms: [
      { en: "Item", cn: "单项", note: "一个数据值，最小单位。" },
      { en: "List", cn: "列表", note: "一串同层数据，有顺序、有索引。" },
      { en: "Tree", cn: "树", note: "带路径的列表集合，可有多级分支。" },
      { en: "Branch", cn: "分支", note: "树里的一条路径下的那串数据。" },
      { en: "Path", cn: "路径", note: "分支的门牌号，如 {0;1}，从根到枝逐级编号。" },
      { en: "Twig", cn: "小枝", note: "GH2 端口的一种数据粒度，介于单项与整树之间。" },
      { en: "Graft", cn: "嫁接", note: "把每个数据项各自装进新分支，强制逐项配对。" },
      { en: "Flatten", cn: "拍平", note: "把所有分支压成一层，丢掉路径信息。" },
      { en: "Simplify", cn: "简化", note: "只清理冗余路径层级，不改数据分组。" },
      { en: "Index", cn: "索引", note: "数据在列表中的位置编号，从 0 开始。" },
      { en: "Null", cn: "空值", note: "表示「没有数据」，会沿着连线向下游传播。" },
      { en: "Access", cn: "数据结构标注", note: "端口声明自己按单项、小枝还是整树来消费数据。" },
    ],
  },
  {
    title: "几何类型",
    desc: "GH2 的几何沿用 Rhino 的类型体系，认得类型才知道什么能接什么。",
    terms: [
      { en: "Point", cn: "点", note: "三维坐标；一切的定位基础。" },
      { en: "Vector", cn: "向量", note: "有方向与长度，没有位置；用于移动、方向计算。" },
      { en: "Plane", cn: "平面", note: "带原点和朝向的坐标系，决定「摆在哪、朝哪边」。" },
      { en: "Curve", cn: "曲线", note: "统称，涵盖直线、圆弧、样条等。" },
      { en: "Line", cn: "直线", note: "两点之间的直线段。" },
      { en: "Polyline", cn: "多段线", note: "多段直线首尾相连，拐角是尖的。" },
      { en: "Arc", cn: "圆弧", note: "圆的一部分，由圆心、半径、起止角决定。" },
      { en: "Circle", cn: "圆", note: "闭合圆弧，是放样、阵列里最常用的截面。" },
      { en: "Rectangle", cn: "矩形", note: "由平面与两个方向尺寸决定。" },
      { en: "Surface", cn: "曲面", note: "单张 NURBS 曲面，带 UV 方向。" },
      { en: "Brep", cn: "多重曲面", note: "由多张曲面拼接缝合而成的实体或壳体。" },
      { en: "Mesh", cn: "网格", note: "由顶点、边、面组成的多边形模型。" },
      { en: "SubD", cn: "细分曲面", note: "用控制笼定义的平滑曲面，适合有机形态。" },
      { en: "Box", cn: "立方体 / 包围盒", note: "轴向对齐的长方体，常用于取范围。" },
      { en: "Transform", cn: "变换", note: "移动、旋转、缩放的统一表示，可批量作用。" },
      { en: "Interval", cn: "区间", note: "一对起止值，常用于参数范围与曲面域。" },
    ],
  },
  {
    title: "数学与逻辑",
    desc: "参数化建模的算术前置知识。",
    terms: [
      { en: "Number", cn: "数值", note: "浮点数，GH2 绝大多数参数都是它。" },
      { en: "Integer", cn: "整数", note: "不带小数的数值，用于索引、数量。" },
      { en: "Boolean", cn: "布尔值", note: "真 / 假，用于条件判断与筛选。" },
      { en: "Domain", cn: "域", note: "参数区间，如曲线的 0 到 1。" },
      { en: "Radian", cn: "弧度", note: "GH2 内部角度单位；与角度互换需要显式转换。" },
      { en: "Tolerance", cn: "容差", note: "判断「是否重合 / 是否相交」的精度阈值。" },
      { en: "Remap", cn: "映射", note: "把一个区间的数值按比例搬到另一个区间。" },
      { en: "Expression", cn: "表达式", note: "用一行公式代替多个运算组件。" },
      { en: "Comparison", cn: "比较", note: "大于、小于、相等等运算，输出布尔值。" },
      { en: "Random Seed", cn: "随机种子", note: "固定它，随机结果才可复现。" },
    ],
  },
  {
    title: "曲线与曲面操作",
    desc: "几何处理里出现频率最高的一批动词。",
    terms: [
      { en: "Divide", cn: "等分", note: "按数量或按距离把曲线/曲面切成若干段。" },
      { en: "Offset", cn: "偏移", note: "沿法向平行复制一条曲线或一张曲面。" },
      { en: "Project", cn: "投影", note: "把几何沿某方向压到一个面上。" },
      { en: "Loft", cn: "放样", note: "用多条截面曲线生成一张连续曲面。" },
      { en: "Sweep", cn: "扫掠", note: "让截面沿路径移动生成曲面。" },
      { en: "Extrude", cn: "挤出", note: "把轮廓沿方向拉出厚度。" },
      { en: "Trim", cn: "修剪", note: "用切割对象把曲线或曲面断开。" },
      { en: "Fillet", cn: "倒角", note: "在两条边之间加圆弧过渡。" },
      { en: "Contour", cn: "等高线 / 切片", note: "用一组平行平面切几何，得到交线。" },
      { en: "Isocurve", cn: "等参线", note: "曲面上 U 或 V 方向固定时的那条线。" },
      { en: "Evaluate", cn: "求值", note: "按参数（如 t 或 uv）取曲线/曲面上的点与坐标系。" },
      { en: "Tangent", cn: "切向", note: "曲线在某点处的方向，决定构件的朝向。" },
    ],
  },
  {
    title: "网格",
    desc: "网格组件对拓扑敏感，术语要分清。",
    terms: [
      { en: "Vertex", cn: "顶点", note: "网格的基本点。" },
      { en: "Edge", cn: "边", note: "连接两个顶点的线段。" },
      { en: "Face", cn: "面", note: "由顶点围成的三角面或四边面。" },
      { en: "Weld", cn: "焊接", note: "把距离极近的顶点合并，修复裂缝。" },
      { en: "Subdivide", cn: "细分", note: "按规则把每个面拆成更多小面。" },
      { en: "Remesh", cn: "重网格", note: "重新生成拓扑更规整的网格。" },
      { en: "Quad Remesh", cn: "四边形重网格", note: "把杂乱网格转成以四边面为主的规整网格。" },
      { en: "ShrinkWrap", cn: "包裹", note: "在几何外包一层封闭网格。" },
    ],
  },
  {
    title: "变换",
    desc: "所有「放过去、转一下、复制一片」的操作。",
    terms: [
      { en: "Move", cn: "移动", note: "按向量平移；最基础的变换。" },
      { en: "Rotate", cn: "旋转", note: "绕轴或绕平面旋转，注意角度单位。" },
      { en: "Scale", cn: "缩放", note: "以某点为中心整体放大缩小。" },
      { en: "Mirror", cn: "镜像", note: "按平面翻转，注意翻转后法向会反向。" },
      { en: "Orient", cn: "朝向对齐", note: "把对象从参考平面搬到目标平面，位置与朝向同时变。" },
      { en: "Array", cn: "阵列", note: "按数量与间距批量复制。" },
      { en: "Shear", cn: "错切", note: "让对象沿某方向倾斜变形。" },
      { en: "Transform Matrix", cn: "变换矩阵", note: "把多种变换合成一次作用，效率更高。" },
    ],
  },
  {
    title: "文档与运行",
    desc: "看懂画布状态与提示信息。",
    terms: [
      { en: "Recompute", cn: "重新计算", note: "手动触发整张画布重算。" },
      { en: "Warning", cn: "警告", note: "组件能算但结果可能不完整，画布上显示为黄色。" },
      { en: "Error", cn: "错误", note: "组件无法求解，显示为红色。" },
      { en: "Type Hint", cn: "类型提示", note: "参数只接受某种类型时，会拒绝其它数据。" },
      { en: "Persistent Data", cn: "持久数据", note: "参数里手动填入的数据，可脱离连线独立存在。" },
      { en: "Runtime", cn: "运行时间", note: "组件上一次求解耗时，用于排查性能瓶颈。" },
    ],
  },
];
