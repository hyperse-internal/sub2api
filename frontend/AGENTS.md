# Sub2API Frontend — Agent Guide

Vue 3 SPA（用户台 / 管理台），构建产物由 Go 嵌入。用中文回复；改动保持聚焦。

## Commands

包管理器：**pnpm**。

| Command | Purpose |
| --- | --- |
| `pnpm dev` | 开发服务（默认 3000；`VITE_DEV_PORT` / 代理 `VITE_DEV_PROXY_TARGET`） |
| `pnpm build` | `check:i18n` → `vue-tsc -b` → 输出到 `../backend/internal/web/dist`（会清空该目录） |
| `pnpm lint` / `lint:check` | ESLint（`lint` 带 `--fix`，注意无关 diff） |
| `pnpm typecheck` | `vue-tsc --noEmit`（**不含**测试文件） |
| `pnpm test:run` | Vitest 单次；路径可收窄 |
| `pnpm check:i18n` | en/zh 键完整性（`build` 必跑） |

## 必须遵守的约定

### i18n

- 文案是 `src/i18n/locales/{en,zh}/**` 的 TS 模块，**必须成对改**。
- 根组装：多数模块 spread；**`admin` 保持嵌套**（`admin.*`）。勿新增会覆盖 spread 的顶层 key。
- `vue-i18n` 已 alias 到 runtime + JIT（CSP）；不要改回完整构建。

### API

- 只用 `src/api/client.ts` 的 `apiClient`（默认 `/api/v1`）。
- `{ code: 0, data }` 已被解包；调用方 `response.data` 即业务数据。错误是普通对象，不是 AxiosError。
- 管理 API 在 `src/api/admin/`；勿自建第二套 axios。

### 功能开关与启动

- 公开设置开关**只**走 `src/utils/featureFlags.ts`（`opt-in` / `opt-out`）。禁止手写 `settings?.xxx_enabled === true` 判断默认开启的开关。
- 新增 flag 须同步后端注入字段（见该文件顶部 checklist + drift 测试）。
- `appStore.initFromInjectedConfig()`（`window.__APP_CONFIG__`）必须在 mount 前执行，防站点名/菜单闪烁。

### 路由 / UI

- 路由与守卫以 `src/router/index.ts` 为准；默认需登录。注意 Simple mode / Backend mode 白名单与 `requiresPayment` 等 meta。
- 侧栏可见性用 `makeSidebarFlag`，与路由 meta 一致。
- **无第三方 UI 库**；复用 `components/common`、`components/layout`；账号 UI 分 `components/account/` 与 `components/admin/account/`，避免第三份拷贝。
- 新垂直功能放 `src/features/<name>/`。测试选择器：`data-test`。
- 主色 teal（`tailwind.config.js`）；部分旧 README（router / stores / indigo）**过时**，以代码为准。

### 质量门禁

Cursor `stop` hook 会对本轮改过的前端文件跑 `eslint --fix`。按改动范围另跑：`typecheck` →（文案）`check:i18n` →（行为）`test:run`。大页面优先局部改。
