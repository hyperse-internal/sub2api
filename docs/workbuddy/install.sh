#!/usr/bin/env bash
# WorkBuddy2API-Hub 非 Docker 一键安装 / 升级（便携包 + systemd）
# 用法（在目标机上）:
#   curl -fsSL <本脚本 URL> | bash
#   或: bash install.sh
# 环境变量:
#   WB_INSTALL_DIR   安装目录，默认 /opt/workbuddy2api
#   WB_VERSION       版本号，默认自动取 GitHub latest（失败回落 v1.7.32）
#   WB_HOST          监听地址，公网反代用 127.0.0.1（默认）
#   WB_PORT          端口，默认 8788
#   WB_API_KEY       可选；不设则首次启动自动生成并写入 accounts/settings.json
#   WB_CN_CHAT_UPSTREAM  海外机访问国内版建议 https://www.workbuddy.cn
set -euo pipefail

GREEN='\033[0;32m'; BLUE='\033[0;34m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

INSTALL_DIR="${WB_INSTALL_DIR:-/opt/workbuddy2api}"
HOST_BIND="${WB_HOST:-127.0.0.1}"
PORT="${WB_PORT:-8788}"
SERVICE_NAME="workbuddy2api"
REPO="ardeyouxipianyi/workbuddy2api-hub"
GH_API="https://api.github.com/repos/${REPO}/releases/latest"
CN_UPSTREAM="${WB_CN_CHAT_UPSTREAM:-https://www.workbuddy.cn}"

echo -e "\n${BLUE}======================================================${NC}"
echo -e "${GREEN} WorkBuddy2API-Hub 便携版一键部署（非 Docker）${NC}"
echo -e "${BLUE}======================================================${NC}\n"

if ! command -v python3 >/dev/null 2>&1; then
  echo -e "${RED}[错误] 需要 Python 3.9+${NC}"
  exit 1
fi
python3 -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 9) else 1)' || {
  echo -e "${RED}[错误] Python 版本过低，需要 3.9+${NC}"
  exit 1
}

for cmd in curl unzip; do
  command -v "$cmd" >/dev/null 2>&1 || { echo -e "${RED}[错误] 缺少命令: $cmd${NC}"; exit 1; }
done

if [ -z "${WB_VERSION:-}" ]; then
  echo -e "${BLUE}[信息] 查询最新 Release...${NC}"
  WB_VERSION="$(curl -fsSL "$GH_API" | python3 -c 'import sys,json; print(json.load(sys.stdin)["tag_name"])' 2>/dev/null || true)"
  WB_VERSION="${WB_VERSION:-v1.7.32}"
fi
# tag 形如 v1.7.32
TAG="$WB_VERSION"
case "$TAG" in v*) ;; *) TAG="v$TAG" ;; esac
ZIP_NAME="workbuddy2api-hub-${TAG}.zip"
ZIP_URL="https://github.com/${REPO}/releases/download/${TAG}/${ZIP_NAME}"
SUMS_URL="https://github.com/${REPO}/releases/download/${TAG}/SHA256SUMS"

echo -e "${BLUE}[信息] 版本: ${TAG}${NC}"
echo -e "${BLUE}[信息] 目录: ${INSTALL_DIR}${NC}"
echo -e "${BLUE}[信息] 监听: ${HOST_BIND}:${PORT}${NC}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo -e "${BLUE}[信息] 下载 ${ZIP_NAME} ...${NC}"
curl -fL --retry 3 -o "$TMP/$ZIP_NAME" "$ZIP_URL"
curl -fL --retry 3 -o "$TMP/SHA256SUMS" "$SUMS_URL"
(
  cd "$TMP"
  if command -v sha256sum >/dev/null 2>&1; then
    grep " ${ZIP_NAME}\$" SHA256SUMS | sha256sum -c -
  else
    grep " ${ZIP_NAME}\$" SHA256SUMS | shasum -a 256 -c -
  fi
)

echo -e "${BLUE}[信息] 解压...${NC}"
unzip -q "$TMP/$ZIP_NAME" -d "$TMP/extract"
# zip 可能带一层目录
SRC="$TMP/extract"
if [ ! -f "$SRC/wb_proxy.py" ]; then
  SRC="$(find "$TMP/extract" -maxdepth 2 -type f -name wb_proxy.py | head -1 | xargs -I{} dirname {})"
fi
[ -f "$SRC/wb_proxy.py" ] || { echo -e "${RED}[错误] 包内未找到 wb_proxy.py${NC}"; exit 1; }

mkdir -p "$INSTALL_DIR/accounts" "$INSTALL_DIR/usage"
# 升级时先把 accounts/usage 挪到旁路，整包覆盖后再移回
STAGE_DATA="$TMP/preserve"
mkdir -p "$STAGE_DATA"
if [ -d "$INSTALL_DIR/accounts" ] && [ "$(ls -A "$INSTALL_DIR/accounts" 2>/dev/null || true)" ]; then
  echo -e "${YELLOW}[升级] 保留 accounts/ usage/${NC}"
  cp -a "$INSTALL_DIR/accounts" "$STAGE_DATA/" 2>/dev/null || true
  cp -a "$INSTALL_DIR/usage" "$STAGE_DATA/" 2>/dev/null || true
fi
# 覆盖程序文件（不删目录本身，避免误伤）
(
  cd "$SRC"
  tar cf - . | (cd "$INSTALL_DIR" && tar xf -)
)
if [ -d "$STAGE_DATA/accounts" ]; then
  rm -rf "$INSTALL_DIR/accounts"
  cp -a "$STAGE_DATA/accounts" "$INSTALL_DIR/accounts"
fi
if [ -d "$STAGE_DATA/usage" ]; then
  rm -rf "$INSTALL_DIR/usage"
  cp -a "$STAGE_DATA/usage" "$INSTALL_DIR/usage"
fi
chmod +x "$INSTALL_DIR"/start-wb-proxy*.sh 2>/dev/null || true

# systemd unit（公网：只绑本机，由 Nginx TLS 反代）
UNIT="/etc/systemd/system/${SERVICE_NAME}.service"
ENV_FILE="/etc/default/${SERVICE_NAME}"
if [ ! -f "$ENV_FILE" ]; then
  umask 077
  cat > "$ENV_FILE" <<EOF
HOST=${HOST_BIND}
PORT=${PORT}
TZ=Asia/Shanghai
WB_CN_CHAT_UPSTREAM=${CN_UPSTREAM}
EOF
  if [ -n "${WB_API_KEY:-}" ]; then
    echo "API_KEY=${WB_API_KEY}" >> "$ENV_FILE"
  fi
  chmod 600 "$ENV_FILE"
fi

cat > "$UNIT" <<EOF
[Unit]
Description=WorkBuddy2API-Hub (wb-proxy)
After=network.target

[Service]
Type=simple
WorkingDirectory=${INSTALL_DIR}
EnvironmentFile=-${ENV_FILE}
ExecStart=/usr/bin/python3 ${INSTALL_DIR}/wb_proxy.py --host \${HOST} --port \${PORT}
Restart=on-failure
RestartSec=3
# 面板一键更新需要写目录；以 root 跑（与本机其他自托管服务一致）
KillSignal=SIGTERM
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"

echo -e "${BLUE}[信息] 等待健康检查...${NC}"
ok=0
for i in $(seq 1 30); do
  if curl -fsS "http://${HOST_BIND}:${PORT}/health" >/dev/null 2>&1; then
    ok=1
    break
  fi
  sleep 1
done
if [ "$ok" -ne 1 ]; then
  echo -e "${RED}[错误] /health 未就绪，见: journalctl -u ${SERVICE_NAME} -n 50 --no-pager${NC}"
  systemctl status "$SERVICE_NAME" --no-pager || true
  exit 1
fi

echo -e "\n${GREEN}[成功] WorkBuddy2API-Hub ${TAG} 已部署${NC}"
echo -e "${BLUE}------------------------------------------------------${NC}"
echo -e "本机看板: http://${HOST_BIND}:${PORT}/"
echo -e "本机 API : http://${HOST_BIND}:${PORT}/v1"
echo -e "公网请用 Nginx/Caddy 反代并加 TLS，不要把 ${PORT} 直接开到公网"
echo -e "服务管理: systemctl status|restart ${SERVICE_NAME}"
echo -e "环境变量: ${ENV_FILE}"
if [ -f "$INSTALL_DIR/accounts/settings.json" ]; then
  echo -e "${YELLOW}API Key / 面板密码见 ${INSTALL_DIR}/accounts/settings.json（首次登录后请改面板密码，默认 admin）${NC}"
fi
echo -e "${BLUE}======================================================${NC}\n"
