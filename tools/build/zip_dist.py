"""把 dist/ 打包成可直接上传的单文件（Cloudflare Pages Direct Upload 用）。

产物：dist-site.zip（根目录即站点根，index.html 在最外层）
用法：npm run zip
"""

from __future__ import annotations

import sys
import zipfile
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"
OUT = ROOT / "dist-site.zip"
REQUIRED = ("index.html",)


def main() -> int:
    if not DIST.exists():
        print("dist/ 不存在，先执行 npm run build", file=sys.stderr)
        return 1

    files = [f for f in DIST.rglob("*") if f.is_file()]
    if not files:
        print("dist/ 是空的，先执行 npm run build", file=sys.stderr)
        return 1

    missing = [name for name in REQUIRED if not (DIST / name).exists()]
    if missing:
        print(f"dist/ 缺少必需文件：{', '.join(missing)}", file=sys.stderr)
        return 1

    if OUT.exists():
        OUT.unlink()

    # 只保留相对 dist 的路径，保证解压后 index.html 位于最外层
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for f in sorted(files):
            zf.write(f, f.relative_to(DIST).as_posix())

    raw_mb = sum(f.stat().st_size for f in files) / 1024 / 1024
    print(f"dist-site.zip  {len(files)} 个文件  原始 {raw_mb:.2f}MB  "
          f"压缩 {OUT.stat().st_size / 1024 / 1024:.2f}MB")
    print("上传：Cloudflare Dashboard → Workers & Pages → Create → Pages → Upload assets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
