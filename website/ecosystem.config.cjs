/**
 * AlphaIO docs website（website/ SSR）— PM2 对照配置。
 *
 * 服务器布局约定：
 *   /opt/sub2api/website/          # 同步构建产物：package.json、node_modules、build/
 *   /opt/sub2api/logs/             # 日志目录（与 Go 服务共用）
 *
 * 首次：
 *   cp docs/deploy/config/ecosystem.config.cjs /opt/sub2api/website/
 *   cd /opt/sub2api/website && pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup
 *
 * 发布后：
 *   cd /opt/sub2api/website && pm2 reload alphaio-docs
 *
 * Nginx upstream `alphaio_docs` → 127.0.0.1:3001（见 ai.alphaio.vip）
 */
module.exports = {
  apps: [
    {
      name: 'alphaio-docs',
      cwd: '/opt/sub2api/website',
      // 用包内 bin.js，勿用 .bin/ 下的 shell shim（PM2+node 会当 JS 解析失败）
      script: './node_modules/@react-router/serve/bin.js',
      args: './build/server/index.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 20,
      min_uptime: '5s',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
        // 仅本机；由 Nginx 反代，勿对公网暴露
        HOST: '127.0.0.1',
      },
      error_file: '/opt/sub2api/logs/alphaio-docs-error.log',
      out_file: '/opt/sub2api/logs/alphaio-docs-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
};
