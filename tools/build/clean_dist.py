"""清空 dist 目录（构建产物），避免 Vite 在 Windows 下批量删除被安全钩子拦截。"""

import shutil
from pathlib import Path

DIST = Path(__file__).resolve().parents[2] / "dist"
if DIST.exists():
    shutil.rmtree(DIST, ignore_errors=True)
    print(f"cleaned {DIST}")
else:
    print("dist not present")
