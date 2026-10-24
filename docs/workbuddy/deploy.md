# 部署 WorkBuddy2API-Hub

非 Docker：便携包 + systemd 一键脚本。官方 `quick-deploy.sh` 是 Docker 方案，本机不用。

参考：[官方 README](https://github.com/ardeyouxipianyi/workbuddy2api-hub/blob/main/README.md)

## 服务器登录

```bash
PEM="docs/server/server.pem"
HOST="root@156.225.27.147"
SSH=(ssh -i "$PEM" -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new -o ConnectTimeout=30)
```

## 线上布局

| 项 | 值 |
| --- | --- |
| 域名 | `https://tools.alphaio.vip` |
| 安装目录 | `/opt/workbuddy2api` |
| 进程 | systemd `workbuddy2api`，监听 `127.0.0.1:8788` |
| 环境变量 | `/etc/default/workbuddy2api` |
| 证书 | `/opt/workbuddy2api/ssl/tools.alphaio.vip.{pem,key}`（仓库副本：`docs/workbuddy/ssl/`） |
| Nginx | `/etc/nginx/sites-available/tools.alphaio.vip`（仓库对照：`docs/workbuddy/nginx.tools.alphaio.vip.conf`） |
| 数据 | `accounts/`、`usage/`（升级不丢） |

面板默认密码 `admin`（首次登录后请改）。本机模式未强制 API Key；需要鉴权时在看板「设置」里生成 Key，或在 `/etc/default/workbuddy2api` 写 `API_KEY=...` 后 `systemctl restart workbuddy2api`。

海外机访问国内版上游已设：`WB_CN_CHAT_UPSTREAM=https://www.workbuddy.cn`。

## 1. 一键安装 / 升级

仓库脚本：`docs/workbuddy/install.sh`。在目标机执行（会拉最新 Release zip、校验 SHA256、装/升到 `/opt/workbuddy2api`、写 systemd 并重启）：

```bash
# 本机上传后执行
scp -i "$PEM" -o IdentitiesOnly=yes docs/workbuddy/install.sh "$HOST:/tmp/install.sh"
"${SSH[@]}" "$HOST" 'chmod +x /tmp/install.sh
WB_HOST=127.0.0.1 WB_PORT=8788 WB_CN_CHAT_UPSTREAM=https://www.workbuddy.cn bash /tmp/install.sh'
```

或已在机上时：

```bash
WB_HOST=127.0.0.1 WB_PORT=8788 WB_CN_CHAT_UPSTREAM=https://www.workbuddy.cn \
  bash /opt/workbuddy2api/install.sh   # 若已拷贝；否则用 /tmp/install.sh
```

再次运行同一脚本即平滑升级（保留 `accounts/`、`usage/`）。

## 2. 证书

```bash
scp -i "$PEM" -o IdentitiesOnly=yes \
  docs/workbuddy/ssl/tools.alphaio.vip.pem \
  docs/workbuddy/ssl/tools.alphaio.vip.key \
  "$HOST:/opt/workbuddy2api/ssl/"
"${SSH[@]}" "$HOST" 'chmod 600 /opt/workbuddy2api/ssl/tools.alphaio.vip.key
chmod 644 /opt/workbuddy2api/ssl/tools.alphaio.vip.pem'
```

## 3. Nginx

```bash
scp -i "$PEM" -o IdentitiesOnly=yes \
  docs/workbuddy/nginx.tools.alphaio.vip.conf \
  "$HOST:/tmp/nginx.tools.alphaio.vip.conf"
"${SSH[@]}" "$HOST" 'cp -a /etc/nginx/sites-available/tools.alphaio.vip \
  /etc/nginx/sites-available/tools.alphaio.vip.bak.$(date +%Y%m%d-%H%M%S)
cp /tmp/nginx.tools.alphaio.vip.conf /etc/nginx/sites-available/tools.alphaio.vip
nginx -t && systemctl reload nginx'
```

## 4. 验证

```bash
"${SSH[@]}" "$HOST" 'curl -fsS http://127.0.0.1:8788/health; echo
curl -fsS https://tools.alphaio.vip/health; echo
systemctl is-active workbuddy2api'
```

- 看板：https://tools.alphaio.vip/
- API：https://tools.alphaio.vip/v1
- 日志：`journalctl -u workbuddy2api -f`

## 运维

```bash
systemctl status|restart|stop workbuddy2api
journalctl -u workbuddy2api -n 100 --no-pager
```

不要把 `8788` 直接暴露到公网；只通过 Nginx TLS 反代。
