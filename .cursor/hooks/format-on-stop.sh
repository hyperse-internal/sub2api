#!/usr/bin/env bash
# afterFileEdit: 记下本轮改过的源文件。
# stop: 只对这些文件 gofmt / eslint --fix；仍失败则 followup_message 让 agent 继续修。
set -euo pipefail

mode="${1:-run}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

if command -v python3 >/dev/null 2>&1; then
  PATH="$(
    python3 -c '
import os
skip = (".cursor-server", ".vscode-server")
p = os.environ.get("PATH", "")
print(":".join(x for x in p.split(":") if x and not any(s in x for s in skip)))
'
  )"
  export PATH
fi

export HOOK_MODE="$mode" HOOK_ROOT="$ROOT" HOOK_STATE="$ROOT/.cursor/hooks/state"
python3 "$ROOT/.cursor/hooks/format_on_stop.py"
