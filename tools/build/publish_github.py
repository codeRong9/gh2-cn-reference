"""把本站一键发布到 GitHub（建仓 + 首推 + 开启 Pages Actions）。

令牌来源优先级：
  1) 命令行 --token
  2) 环境变量 GITHUB_TOKEN
  3) IDE 的 MCP 配置 <用户目录>/.codebuddy/mcp.json 里的 GitHub PAT

用法：
  python tools/build/publish_github.py                 # 默认仓库名 gh2-cn-reference
  python tools/build/publish_github.py --repo gh2-cn   # 自定义仓库名
  python tools/build/publish_github.py --dry-run       # 只检查令牌与本地状态

设计要点：
  * 令牌只用于单次 push 的 URL 和 API 头，不写进 .git/config
  * 仓库已存在时复用，不覆盖远端历史
  * Pages 未开启时自动设置为 GitHub Actions 构建
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parents[2]
API = "https://api.github.com"
MCP_CONFIG = Path.home() / ".codebuddy" / "mcp.json"
DEFAULT_REPO = "gh2-cn-reference"
DESCRIPTION = "Grasshopper 2 中文学习与速查站：1410 个原生组件中文速查 + 171 篇核心组件精讲 + 画布识别台"


def git_exe() -> str:
    for name in ("git", r"C:\Program Files\Git\cmd\git.exe"):
        try:
            subprocess.run([name, "--version"], capture_output=True, check=True)
            return name
        except (OSError, subprocess.CalledProcessError):
            continue
    raise SystemExit("未找到 git，请先安装 https://git-scm.com/download/win")


def git(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    exe = git_exe()
    result = subprocess.run([exe, *args], cwd=ROOT, capture_output=True, text=True,
                            encoding="utf-8", errors="replace")
    if check and result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        raise SystemExit(f"git {' '.join(args)} 失败")
    return result


def read_token(cli_token: str | None) -> str:
    if cli_token:
        return cli_token.strip()
    env = os.environ.get("GITHUB_TOKEN", "").strip()
    if env:
        return env
    if MCP_CONFIG.exists():
        try:
            cfg = json.loads(MCP_CONFIG.read_text(encoding="utf-8"))
            token = cfg["mcpServers"]["GitHub"]["env"]["GITHUB_PERSONAL_ACCESS_TOKEN"]
            if token:
                return token.strip()
        except (KeyError, json.JSONDecodeError):
            pass
    raise SystemExit(
        "没有可用的 GitHub 令牌。请任选一种方式：\n"
        "  A. 在 IDE 设置里更新 GitHub MCP 的 Personal Access Token（需 repo + workflow 权限）\n"
        "  B. 命令行：python tools/build/publish_github.py --token ghp_xxx\n"
        "  C. 设置环境变量 GITHUB_TOKEN 后重跑"
    )


def api(method: str, path: str, token: str, body: dict | None = None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        API + path,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "gh2-cn-reference-publisher",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode("utf-8")
            return resp.status, (json.loads(raw) if raw else {})
    except urllib.error.HTTPError as err:
        raw = err.read().decode("utf-8", errors="replace")
        try:
            payload = json.loads(raw)
        except json.JSONDecodeError:
            payload = {"message": raw}
        return err.code, payload


def ensure_identity(login: str) -> None:
    name = git("config", "--local", "user.name", check=False).stdout.strip()
    if not name:
        git("config", "--local", "user.name", login)
        print(f"已设置仓库身份 user.name={login}")
    email = git("config", "--local", "user.email", check=False).stdout.strip()
    if not email:
        git("config", "--local", "user.email", f"{login}@users.noreply.github.com")
        print(f"已设置仓库身份 user.email={login}@users.noreply.github.com")


def commit_all(login: str) -> None:
    if not (ROOT / ".git").exists():
        git("init", "-b", "main")
        print("已初始化本地仓库 (main)")
    ensure_identity(login)

    ignored = (ROOT / ".git" / "info" / "exclude")
    ignored.parent.mkdir(parents=True, exist_ok=True)
    if not ignored.exists():
        ignored.write_text("", encoding="utf-8")

    git("add", "-A")
    pending = git("status", "--porcelain").stdout.strip()
    if pending:
        count = len(pending.splitlines())
        git("commit", "-m", f"feat: GH2 中文操作库（1410 组件 / 171 篇精讲）· {count} 个文件变更")
        print(f"已提交 {count} 条变更")
    else:
        print("工作区干净，跳过提交")


def push(token: str, login: str, repo: str) -> None:
    auth = base64.b64encode(f"x-access-token:{token}".encode()).decode()
    url = f"https://github.com/{login}/{repo}.git"
    git("remote", "remove", "origin", check=False)
    git("remote", "add", "origin", url)
    result = subprocess.run(
        [git_exe(), "-c", f"http.extraHeader=AUTHORIZATION: basic {auth}",
         "push", "--no-verify", "-u", "origin", "HEAD:main"],
        cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    if result.returncode != 0:
        print(result.stdout[-1500:], file=sys.stderr)
        print(result.stderr[-1500:], file=sys.stderr)
        raise SystemExit("推送失败：请确认令牌具备 repo（含 workflow）权限")
    print("已推送到 GitHub")


def enable_pages(login: str, repo: str, token: str) -> str:
    status, payload = api("POST", f"/repos/{login}/{repo}/pages", token, {"build_type": "workflow"})
    if status in (201, 204):
        print("已开启 GitHub Pages（GitHub Actions 构建）")
    elif status == 409:
        print("GitHub Pages 已开启，跳过")
    else:
        print(f"开启 Pages 返回 {status}: {payload.get('message')}")
    return f"https://{login}.github.io/{repo}/"


def main() -> int:
    parser = argparse.ArgumentParser(description="发布 GH2 中文操作库到 GitHub Pages")
    parser.add_argument("--repo", default=DEFAULT_REPO, help="仓库名")
    parser.add_argument("--token", default=None, help="GitHub Personal Access Token")
    parser.add_argument("--dry-run", action="store_true", help="只校验令牌，不建仓不推送")
    args = parser.parse_args()

    token = read_token(args.token)

    status, user = api("GET", "/user", token)
    if status != 200:
        raise SystemExit(
            f"令牌无效（HTTP {status}: {user.get('message')}）。\n"
            "请在 https://github.com/settings/tokens 重新生成，勾选 repo 与 workflow，"
            "然后更新 IDE 的 GitHub MCP 配置或加 --token 参数。"
        )
    login = user["login"]
    print(f"令牌有效，账号：{login}")

    if args.dry_run:
        print("dry-run：跳过建仓与推送")
        return 0

    status, repo_info = api("GET", f"/repos/{login}/{args.repo}", token)
    if status == 404:
        status, repo_info = api("POST", "/user/repos", token, {
            "name": args.repo,
            "description": DESCRIPTION,
            "private": False,
            "has_issues": True,
            "has_wiki": False,
            "auto_init": False,
        })
        if status not in (200, 201):
            raise SystemExit(f"建仓失败（HTTP {status}）：{repo_info.get('message')}")
        print(f"已创建仓库 https://github.com/{login}/{args.repo}")
    elif status == 200:
        print("仓库已存在，复用")
    else:
        raise SystemExit(f"查询仓库失败（HTTP {status}）：{repo_info.get('message')}")

    commit_all(login)
    push(token, login, args.repo)
    site = enable_pages(login, args.repo, token)

    print("\n完成：")
    print(f"  代码    https://github.com/{login}/{args.repo}")
    print(f"  站点    {site}")
    print("  Actions 首次构建约 1-2 分钟，可在仓库 Actions 页查看进度。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
