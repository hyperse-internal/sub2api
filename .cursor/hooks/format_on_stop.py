#!/usr/bin/env python3
"""Record edited paths on afterFileEdit; format and autofix them on stop."""

import json
import os
import shutil
import subprocess
import sys

ROOT = os.environ["HOOK_ROOT"]
STATE_DIR = os.environ["HOOK_STATE"]
MODE = os.environ.get("HOOK_MODE", "run")

FRONTEND_EXT = {".vue", ".js", ".jsx", ".cjs", ".mjs", ".ts", ".tsx", ".cts", ".mts"}


def emit(obj):
    sys.stdout.write(json.dumps(obj, ensure_ascii=False) + "\n")


def safe_id(value):
    text = str(value or "default")
    cleaned = "".join(ch if ch.isalnum() or ch in "-_" else "_" for ch in text)
    return (cleaned[:80] or "default")


def list_path(conv):
    return os.path.join(STATE_DIR, safe_id(conv) + ".list")


def rel_of(path):
    if not isinstance(path, str) or not path:
        return None
    abs_path = path if os.path.isabs(path) else os.path.join(ROOT, path)
    abs_path = os.path.realpath(abs_path)
    root_real = os.path.realpath(ROOT)
    if abs_path != root_real and not abs_path.startswith(root_real + os.sep):
        return None
    rel = os.path.relpath(abs_path, root_real).replace("\\", "/")
    if rel.startswith(".."):
        return None
    return rel


def interesting(rel):
    if rel.startswith(("frontend/node_modules/", "frontend/coverage/", "backend/internal/web/dist/")):
        return False
    ext = os.path.splitext(rel)[1]
    if rel.startswith("frontend/") and ext in FRONTEND_EXT:
        return True
    return rel.startswith("backend/") and ext == ".go"


def read_list(path):
    if not os.path.isfile(path):
        return []
    with open(path, encoding="utf-8") as fh:
        return [line.strip() for line in fh if line.strip()]


def write_list(path, items):
    os.makedirs(STATE_DIR, exist_ok=True)
    uniq = []
    seen = set()
    for item in items:
        if item not in seen:
            seen.add(item)
            uniq.append(item)
    with open(path, "w", encoding="utf-8") as fh:
        if uniq:
            fh.write("\n".join(uniq) + "\n")


def run(cmd, cwd):
    proc = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True)
    return proc.returncode, (proc.stdout or "") + (proc.stderr or "")


def main():
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        payload = {}
    if not isinstance(payload, dict):
        payload = {}

    if MODE == "record":
        rel = rel_of(payload.get("file_path"))
        if rel and interesting(rel):
            path = list_path(payload.get("conversation_id"))
            write_list(path, read_list(path) + [rel])
        emit({})
        return

    status = str(payload.get("status") or "completed")
    if status in ("aborted", "error"):
        emit({})
        return

    conv = payload.get("conversation_id")
    targets = []
    if conv:
        path = list_path(conv)
        if os.path.isfile(path):
            targets.append(path)
    elif os.path.isdir(STATE_DIR):
        targets = [
            os.path.join(STATE_DIR, name)
            for name in os.listdir(STATE_DIR)
            if name.endswith(".list")
        ]

    files = []
    seen = set()
    for path in targets:
        for rel in read_list(path):
            rel = rel.replace("\\", "/")
            if rel in seen or not interesting(rel):
                continue
            if not os.path.isfile(os.path.join(ROOT, rel)):
                continue
            seen.add(rel)
            files.append(rel)

    if not files:
        emit({})
        return

    failures = []
    go_files = [rel[len("backend/") :] for rel in files if rel.startswith("backend/") and rel.endswith(".go")]
    fe_files = [rel[len("frontend/") :] for rel in files if rel.startswith("frontend/")]

    if go_files:
        backend = os.path.join(ROOT, "backend")
        if shutil.which("golangci-lint"):
            code, out = run(["golangci-lint", "fmt", *go_files], backend)
            tool = "golangci-lint fmt"
        else:
            code, out = run(["gofmt", "-w", *go_files], backend)
            tool = "gofmt -w"
        if code != 0:
            failures.append((tool, code, out))

    if fe_files:
        frontend = os.path.join(ROOT, "frontend")
        eslint = os.path.join(frontend, "node_modules", ".bin", "eslint")
        if not os.path.isfile(eslint):
            failures.append(("frontend eslint", 127, "缺少 frontend/node_modules/.bin/eslint，请先在 frontend 执行 pnpm install"))
        else:
            code, out = run([eslint, "--fix", *fe_files], frontend)
            if code != 0:
                failures.append(("eslint --fix", code, out))

    if failures:
        chunks = []
        for tool, code, out in failures:
            chunks.append(f"**Command:** `{tool}`\n**Exit code:** {code}\n\n```text\n{out[-8000:]}\n```")
        emit({
            "followup_message": (
                "stop hook 已尝试格式化并自动修复，仍有问题需要你处理。只改本轮相关文件，修完后结束即可。\n\n"
                + "\n\n".join(chunks)
            )
        })
        return

    for path in targets:
        try:
            os.remove(path)
        except OSError:
            pass
    print(f"[format-on-stop] formatted {len(files)} file(s)", file=sys.stderr)
    emit({})


if __name__ == "__main__":
    main()
