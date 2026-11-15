export interface PortRecord {
  name: string;
  nick: string;
  info: string;
  type: string;
  access: "item" | "twig" | "tree" | null;
  requirement: "must" | "may-be-null" | "may-be-missing" | null;
  cn?: string;
  infoCn?: string;
}

export interface DetailScene {
  title: string;
  body: string;
  wiring?: string;
}

export interface ComponentDetail {
  concept?: string;
  steps?: string[];
  scenes?: DetailScene[];
  pitfalls?: string[];
  related?: string[];
  tip?: string;
}

export interface ComponentRecord {
  id: string;
  lib: string;
  libCn: string;
  assembly: string;
  namespace: string;
  typeName: string;
  fullTypeName: string;
  guid: string | null;
  name: string;
  cn: string;
  summary: string;
  info: string;
  alias?: string;
  chapter: string;
  section: string;
  sectionCn: string;
  slot: number | null;
  sortKey: string | null;
  icon: string | null;
  iconKey: string | null;
  inputs: PortRecord[];
  outputs: PortRecord[];
  hasDetail: boolean;
  detail?: ComponentDetail;
}

export interface LibSection {
  name: string;
  cn: string;
  chapter: string;
  count: number;
}

export interface LibNode {
  lib: string;
  cn: string;
  desc: string;
  count: number;
  sections: Record<string, LibSection>;
}

export interface Meta {
  componentCount: number;
  libCount: number;
  portCount: number;
  detailCount: number;
  translatedCount: number;
  withIcon: number;
  libs: LibNode[];
  typeCounts: Record<string, number>;
}

export interface IndexItem {
  id: string;
  n: string;
  c: string;
  l: string;
  ch: string;
  se: string;
  seC: string;
  t: string[];
  d: 0 | 1;
  in: number;
  out: number;
  i?: string | null;
  py?: string;
  pyi?: string;
}

export interface LibPayload {
  lib: string;
  components: ComponentRecord[];
}
