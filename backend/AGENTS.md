# Sub2API Backend — Agent Guide

Go API / Gateway（模块 `github.com/Wei-Shaw/sub2api`，Go **1.27.2**）。用中文回复；改动保持聚焦。

## Commands

在 `backend/` 下执行：

| Command | Purpose |
| --- | --- |
| `make build` | 编译 `bin/server`（**无** `-tags embed`，不含前端） |
| `make generate` | `go generate ./ent` + Wire（`./cmd/server`） |
| `make test` | 无 tag 的 `go test ./...` + `golangci-lint` |
| `make test-unit` | `-tags=unit`（CI 单元任务） |
| `make test-integration` | `-tags=integration`（需 Docker；CI 必过） |
| `make test-e2e` / `test-e2e-local` | e2e 脚本 / `-tags=e2e` |

带前端的发布构建：先产出 `internal/web/dist`，再 `go build -tags embed ./cmd/server`。勿手改 `ent/` 生成码与已提交的 `wire_gen.go`（改依赖后跑 `make generate`）。

## 必须遵守的约定

### 分层与依赖

- Wire：`config` → `repository` → `service` → `handler` → `server`。
- **Repository 接口写在 `service`，实现写在 `repository`。** `handler` / `service` 禁止 import `internal/repository`、gorm、go-redis（depguard；少数 ops 文件例外见 `.golangci.yml`）。
- Schema 真相是 **`migrations/*.sql`**（启动时 `InitEnt` 应用），不是 Ent auto-migrate。改表：新 SQL + `ent/schema` + `go generate ./ent`。**已应用的 migration 不可改**。不要指望不存在的 `make migrate-*`。
- `*_notx.sql` 仅用于 `CREATE/DROP INDEX CONCURRENTLY`。
- 新平台只登记 `internal/domain/platforms.go`（平台 CHECK 已去掉）；渠道监控等 capability CHECK 另论。
- 新后台 worker：Wire 注入，并在 `cmd/server/wire.go` 的 `provideCleanup` 注册停止，否则泄漏 goroutine。

### HTTP 面与响应形态（勿混用）

| 面 | 前缀 | 说明 |
| --- | --- | --- |
| 面板 API | `/api/v1/*` | `{code:int, message, data?}`，成功 `code=0`（`internal/pkg/response`） |
| 中间件 abort | — | `{code:string, message}`（如 `TOKEN_EXPIRED`） |
| Gateway | `/v1`、`/v1beta`、`/antigravity/...` 等 | **厂商形状**错误体；按 API Key 所属 group 的 **platform** 分发，不是只看 URL |

Gateway 不在 `/api/v1` 下。OpenAI 族走 `OpenAIGatewayService`，Anthropic 族走 `GatewayService`（见 `routes/gateway.go` / `domain.UsesOpenAIGateway`）。

### 配置与运行模式

- Viper：`config.yaml` / `CONFIG_FILE` / `DATA_DIR` 等；功能开关多在 DB `settings` 表，不在 yaml。
- `run_mode: simple` 会关掉计费与配额校验（易静默改行为）。
- 鉴权限流依赖 Redis；Redis 不可用时部分限流 **fail-close**。

### 公开设置 / SSR 注入

新增会对前端菜单可见的 public setting 时，必须同步：

1. `SettingKey…`（`domain_constants.go`）
2. `settings_view.go` / `setting_public.go`（含 **`PublicSettingsInjectionPayload`**）
3. `handler/dto/settings.go` + user/admin setting handlers
4. 前端：`types`、`featureFlags.ts`（opt-in/out）、Settings UI、侧栏

漏写注入字段会挂 `public_settings_injection_schema_test`；opt-in 开关刷新后菜单会消失。改设置后须让前端 HTML 缓存失效（`FrontendServer.InvalidateCache`）。

### 测试与质量

- 需要 Docker 的测试必须打 `//go:build integration`；无 tag 的测试会进 `go test ./...` / unit CI——勿把集成测混进无 tag 包。
- Cursor `stop` hook 会对本轮改过的 `.go` 跑 `gofmt`（有 `golangci-lint` 时用 `golangci-lint fmt`）。
- CI：`test-unit`、`test-integration`、golangci-lint v2。gosec 在生产代码比测试更严。
- 计费 / Gateway 调度 / 设置注入是高风险区；改动跑相关包测试，勿无必要大重构巨型 service。
