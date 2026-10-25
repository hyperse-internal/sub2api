# 按请求次数订阅（Request Pack）设计方案

> 状态：已评审（v2，按评审意见收敛为 MVP）  
> 范围：`backend` 订阅 / 兑换 / 支付 / 网关准入  
> 目标：支持「指定模型（一个或多个），在一定时间范围内，按请求次数计费」的订阅商品，并覆盖充值、兑换与多次兑换叠加。

## 0. 评审结论与 v2 变更

结论：**壳 + 请求包表**的方向合理，予以采纳。评审后做了以下收敛，v1 草案中与之冲突的内容均已废弃：

| 项 | v1 草案 | v2 决策 |
| --- | --- | --- |
| 扣次时机 | 进上游前预扣，失败再退 | **准入只读，在计费事务（`usageBillingRepository.Apply`）内后扣**，复用 `usage_billing_dedup` 幂等；失败请求天然不扣 |
| 准入位置 | 改 `CheckBillingEligibility` 签名 | **新增中间件**，紧跟 `GroupModelAllowlist`；不改约 30 处 handler 调用点 |
| 计量分组标识 | 无（靠 `plan.quota_mode`） | `groups.request_pack_enabled`；删除 `quota_mode` |
| 包状态 | `active/exhausted/expired/revoked` | 仅 `revoked_at`；用尽、过期由字段推导 |
| 壳过期 | 「取 max(包过期)」与 `AssignOrExtend` 矛盾 | 沿用 `AssignOrExtendSubscription`，壳过期时间天然 ≥ 所有包；对用户展示取包的最大过期时间 |
| 退款 | 一句「revoke 包」 | 明确改造 `payment_refund.go` 的扣减与回滚点（见 5.4） |
| Redis 预留 / 镜像剩余 | 建议 | 首版不做，用 DB 索引查询 + 进程内短 TTL 缓存 |
| 其他 | 双闸、admin 发包、负天数作废包、`daily_refresh`、多种错误码 | 首版均不做 |

## 1. 背景与目标

### 1.1 业务目标

- 针对**指定模型**（一个或多个），售卖「在有效期内最多 N 次请求」的订阅权益。
- 支持管理端生成兑换码、用户兑换、支付购买套餐（充值履约）。
- 多次兑换 / 多次购买时，次数可叠加，且各自带独立有效期。
- 网关按**请求次数**扣减，而不是按 USD 伪装。

### 1.2 现有能力为什么不够

| 维度 | 现状 | 目标缺口 |
| --- | --- | --- |
| 计量单位 | 分组 `daily/weekly/monthly_limit_usd` | 需要请求次数，不是金额 |
| 模型范围 | `model_allowlist` 仅做准入 | 需要按模型集合计次 |
| 叠加语义 | 同用户同分组仅 1 行 `user_subscriptions`，兑换/购买 = **延长 `expires_at`** | 需要 **加次数**（可多包） |
| 套餐 / 兑换码 | 只有 `validity_days`，无 N、无模型列表 | 需携带 `request_count` + `models` |
| 准入时机 | `CheckBillingEligibility` 不接收 model | 次数闸必须在已知客户端模型之后 |

不推荐用「`daily_limit_usd = N` + 每次计费 1 美元」伪装次数：存在倍率、`ActualCost`、并发超卖，且叠加仍是延时而非加 N。

### 1.3 设计原则

1. **尽量复用**现有 Group / UserSubscription / Redeem / Payment 链路（绑 Key、鉴权壳、履约幂等）。
2. **配额与壳分离**：时间/身份壳继续用 `UserSubscription`；次数用新台账表。
3. **叠加默认 = 多包累加次数**，不是只加日历天数。
4. 匹配模型使用客户端 **`requested_model`**，与 `model_allowlist` 同一套匹配规则。
5. **不过度设计**：能由字段推导的状态不落库，能复用现有幂等的不另造。

---

## 2. 推荐架构：订阅壳 + 请求包

```text
Group (subscription_type = subscription, request_pack_enabled = true)
  ├─ 路由 / 平台 / model_allowlist / RPM
  └─ UserSubscription  ← 每用户每分组 1 行：管「有没有权绑 Key、能不能进网关」
        └─ RequestPack[]  ← 每次兑换/购买一包：管「还能打几次、哪些模型、何时过期」
```

### 2.1 职责划分

| 实体 | 职责 |
| --- | --- |
| `groups` | 平台、调度、RPM、allowlist；**`request_pack_enabled` 标识该分组按次计量** |
| `user_subscriptions` | 活跃订阅壳；API Key 归属分组仍依赖 `GetActiveSubscription` |
| `subscription_request_packs`（新） | 次数余额、模型范围、包级有效期、来源幂等 |
| `subscription_plans` / `redeem_codes` / `payment_orders` | 商品与履约快照：`request_count`、`models`、有效天数 |

### 2.2 为何不直接在 `UserSubscription` 上加字段

- 唯一约束 `(user_id, group_id)`，无法并存「两笔 1000 次 / 不同过期时间」。
- 现有兑换/支付叠加语义是延时；改成「加 N」会与 USD 订阅语义冲突。
- 包表可独立退款、作废、幂等，不污染 USD 日/周/月窗口字段。

### 2.3 `request_pack_enabled` 的语义

网关必须区分「老 USD 订阅」「次数用尽」「管理员手动 assign 但没发包」三种情况，因此在分组上加一个布尔开关：

- `false`（默认）：完全保持现状，不查包、不扣次。
- `true`：该分组仅按次计量。**没有任何可用包（含：有壳无包）一律拒绝**，即 fail closed。
- 开启时，创建套餐 / 兑换码必须带 `request_count > 0` 且 `models` 非空；请求包分组不配置 USD 日/周/月限额（首版不支持双闸）。

---

## 3. 数据模型

> Schema 以 `backend/migrations/*.sql` 为准，同步补 `ent/schema` 并 `make generate`；已应用的 migration 不可改。

### 3.1 新表 `subscription_request_packs`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | bigint PK | |
| `user_id` | bigint NOT NULL | |
| `group_id` | bigint NOT NULL | |
| `models` | jsonb NOT NULL | 如 `["deepseek-v4.1-flash"]` 或 `["*"]`；匹配复用 `GroupModelAllowlist.Allows` |
| `request_limit` | int NOT NULL | 本包总次数，`> 0` |
| `requests_used` | int NOT NULL DEFAULT 0 | 已用次数 |
| `expires_at` | timestamptz NOT NULL | 包过期时间（履约时刻 + 有效天数，受 `MaxExpiresAt` 约束） |
| `revoked_at` | timestamptz NULL | 退款 / 作废时设置 |
| `redeem_code_id` | bigint NULL | 来源：兑换码 |
| `payment_order_id` | bigint NULL | 来源：支付订单 |
| `created_at` / `updated_at` | timestamptz | |

索引：

- `(user_id, group_id, expires_at)` — 热路径选包
- `UNIQUE (redeem_code_id) WHERE redeem_code_id IS NOT NULL`
- `UNIQUE (payment_order_id) WHERE payment_order_id IS NOT NULL`

可用条件（不落状态枚举，全部推导）：

```text
available = revoked_at IS NULL AND now < expires_at AND requests_used < request_limit
remaining = request_limit - requests_used
```

### 3.2 其他表新增字段

| 表 | 新字段 | 说明 |
| --- | --- | --- |
| `groups` | `request_pack_enabled bool default false` | 见 2.3 |
| `subscription_plans` | `request_count int NULL`、`models jsonb NULL` | 分组开启时必填 |
| `redeem_codes` | `request_count int NULL`、`models jsonb NULL` | `type=subscription` 时使用 |
| `payment_orders` | `subscription_request_count`、`subscription_models` | 下单时快照，对齐现有 `subscription_days`，避免事后改套餐影响已付订单 |

兑换码字段语义：

- `validity_days`：**包有效期**（兑换成功后从 `now` 起算），不是兑换码本身过期；`<=0` 默认 30，与现有一致。
- 兑换码本身过期仍用 `expires_at`。
- `request_count` 为空：保持现有「仅延时 + 分组 USD」语义，兼容老码。
- 对 `request_pack_enabled` 分组，**拒绝负天数兑换码**。

### 3.3 `user_subscriptions`

结构不变。兑换 / 购买请求包时仍调用 `AssignOrExtendSubscription`：

- 该方法在壳现有过期时间上累加天数（已过期则从 `now` 起），而包过期时间从 `now` 起算，因此**壳过期时间天然 ≥ 所有包的过期时间**，无需再单独计算 max，也不用改 `api_key_auth`。
- 面向用户展示的「到期时间」取**包的最大过期时间**，不展示壳的。
- 管理员撤销壳（软删除）时，包因过不了壳校验而不可用；`RestoreSubscription` 恢复壳后包随之恢复，**无需联动处理包**。

---

## 4. 叠加语义

| 场景 | 行为 |
| --- | --- |
| 首次兑换 / 购买 | 创建或激活壳 + 插入 Pack A |
| 未过期再次兑换同分组 | **再插 Pack B**，不合并；两包各自扣次、各自过期 |
| 扣次顺序 | FIFO：优先扣更早过期的包（`ORDER BY expires_at ASC, id ASC`），且仅考虑覆盖该模型的包 |
| 一包用尽 / 过期 | 不再被选中（由字段推导），继续扣下一可用包 |
| 全部用尽 / 过期 / 无覆盖该模型的包 | 准入拒绝，`REQUEST_QUOTA_EXCEEDED`（HTTP 429） |
| 过期后再兑换 | 新包 + 现有 renew 壳逻辑 |
| 支付退款 | 按 `payment_order_id` 将包 `revoked_at` 置位，已用次数不追回（见 5.4） |

产品文案需明确：**多次兑换 = 加次数（多包），不是只加日历天数。**

**计数口径**：「一次请求」= 一次成功落账的 `RecordUsage`（即一次客户端请求）。

- 故障转移重试只计 1 次；同一 `request_id` 重复落账只计 1 次。
- 失败、无 usage、`count_tokens`、模型列表等不计。
- 图片 / 视频 / 语音：一次请求计 1 次（不按张/秒放大）。

**买断包**：`N 次 / 有效期 T`，用完或到期即止，不按自然日重置。「每日刷新」类商品不在本方案范围，后续另议。

---

## 5. 全流程设计

### 5.1 兑换

```text
Redeem(type=subscription, request_count>0)
  → Redis 锁码 + Use(status=unused)                 // 现有逻辑
  → AssignOrExtendSubscription(validity_days)       // 壳
  → INSERT subscription_request_packs(redeem_code_id) // 同一 ent 事务
  → 提交事务；失效订阅 / 包缓存
```

- 包与兑换码标记在同一事务，`redeem_code_id` 唯一索引兜底。
- 响应回执返回 `request_count`、`models`、`expires_at`。

### 5.2 支付 / 充值履约

```text
支付成功 fulfill
  → ensurePaymentSubscriptionAssigned（同一事务）
       └─ 仅在 !alreadyAssigned 分支：assignOrExtend 壳 + INSERT pack(payment_order_id)
  → 写 SUBSCRIPTION_ASSIGNED 审计（现有幂等点）
```

- 插包必须和壳续期、审计日志同事务，且只在 `!alreadyAssigned` 分支执行，避免重试重复发包。
- 历史订单的 `recoveredFromNote` 恢复分支不补发包（新订单两者同事务，不会出现壳有而包无）。
- 下单（`createOrderInTx`）时把套餐的 `request_count`、`models` 快照到订单。

### 5.3 网关准入与扣次

#### 准入（只读）

新增中间件，例如 `GroupRequestPack`，挂在每条网关链的 `GroupModelAllowlist` 之后：

1. 分组未开启 `request_pack_enabled` → 直接放行。
2. 提取客户端 model（复用 allowlist 中间件的提取逻辑，或抽成共用函数）；提取不到（如 `GET /v1/models`）→ 放行。
3. 读取该 `(user, group)` 的可用包（DB 索引查询 + 进程内短 TTL 缓存），用 `GroupModelAllowlist{Enabled:true, Models}.Allows(model)` 判断是否有覆盖该模型且可用的包。
4. 没有 → `ErrRequestQuotaExceeded`（`infraerrors.TooManyRequests("REQUEST_QUOTA_EXCEEDED", ...)`），并按入口协议格式返回。需同步检查 `api_key_auth` 等处对订阅类错误的映射，避免新错误落成 500/503。

缓存失效：兑换、支付履约、退款、包被扣到用尽时，复用现有订阅缓存失效（含 `PublishSubscriptionCacheInvalidation`）。

已知限制（需在运营文案中知晓）：

- Responses WebSocket 入口会跳过中间件，仅在握手时（`openai_gateway_handler.go` 的 `CheckBillingEligibility` 位置）补一次包检查，**每轮不复检**；USD 订阅现状相同。

#### 扣次（计费事务内后扣）

所有成功请求经 `applyUsageBilling`（`gateway_usage_billing.go` 与 `openai_gateway_usage.go` 两个调用点）→ `usageBillingRepository.Apply`，该方法先 claim `usage_billing_dedup`，再在同一事务里做各项扣减。扣次放在这里：

1. `UsageBillingCommand` 新增 `GroupID`、`RequestedModel`（取自 `usageLog.RequestedModel`）、`RequestPack bool`（分组开启时为 true）。
2. `applyUsageBillingEffects` 中：
   ```sql
   SELECT id, models FROM subscription_request_packs
   WHERE user_id = $1 AND group_id = $2
     AND revoked_at IS NULL AND expires_at > now() AND requests_used < request_limit
   ORDER BY expires_at ASC, id ASC
   FOR UPDATE;
   ```
3. 在 Go 中用 allowlist 匹配规则找第一个覆盖 `RequestedModel` 的包，再：
   ```sql
   UPDATE subscription_request_packs
   SET requests_used = requests_used + 1, updated_at = now()
   WHERE id = $1 AND requests_used < request_limit;
   ```
4. 找不到可用包（准入后被并发用完 / 过期）：不报错，记 warn 日志即可，请求已服务完毕。
5. 扣次后若包用尽，失效该用户该分组的包缓存。

要点：

- 同一 `request_id` 只扣一次（dedup 保证），无需另做幂等。
- 失败请求没有 usage，天然不扣，不需要「失败退次」策略。
- 通配符匹配在 Go 中完成，复用 `models/` 前缀、`-thinking` 等归一化规则；匹配字段是客户端 `requested_model`，不是 `upstream_model`。
- 扣次用 `database/sql`（与 `Apply` 同一 `sql.Tx`）；插包与查询走 ent，不混用事务。
- **软限制**：准入读到的剩余次数可能略旧，并发下会有少量超卖，属可接受；RPM / 并发限制继续约束突发。

### 5.4 退款

`payment_refund.go` 现有订阅订单退款流程会调用 `ExtendSubscription(-days)` 缩短壳，并在多处回滚（`prepDeduct`、`ExecuteRefund` 及其失败回滚点）。请求包订单需改造：

- 判定：订单带 `subscription_request_count`。
- 扣减：改为按 `payment_order_id` 将包 `revoked_at = now()`，**不再调用** `ExtendSubscription`。
- 回滚：对应将 `revoked_at` 置回 `NULL`。
- 已用次数不追回；壳不缩短（包被作废后壳无可用包，网关 fail closed）。
- 幂等与「重试时上次回滚失败」的审计判断（`REFUND_ROLLBACK_FAILED`）沿用现有流程。

此步工作量较大，**独立成一个落地步骤**，不与兑换流程捆绑。

### 5.5 与 USD / RPM / API Key 的关系

- **RPM**（`groups.rpm_limit` / `users.rpm_limit`）：与买断次数正交，保留。
- **分组 USD 日/周/月限额**：请求包分组不配置，首版不支持双闸。
- **API Key 自身额度与限速窗口**：照常生效。
- **`usage_logs`**：继续记账；包扣次是配额，不替代成本日志。请求包商品可将 `per_request` 单价配为 0，或仍按 token 记内部成本。

---

## 6. 管理端 / 用户端（概要）

### 6.1 管理端

- 分组：增加「按请求次数计量」开关。
- 生成兑换码：订阅类型增加「请求次数」「适用模型」「有效天数」。
- 套餐：增加次数、模型；列表区分 USD 套餐与次数套餐。
- 订阅详情：展示用户该分组下各包剩余次数、过期时间、是否已作废。

### 6.2 用户端

- 「我的订阅」：汇总剩余次数 + 模型范围 + 最近/最大过期时间；可展开包列表。
- 兑换成功回执：返回 `request_count`、`models`、`expires_at`。

### 6.3 错误码

| code | HTTP | 场景 |
| --- | --- | --- |
| `REQUEST_QUOTA_EXCEEDED` | 429 | 无可用次数（含有壳无包、包已作废）；message 可区分「模型不在套餐内」 |

---

## 7. 备选方案对比

| 方案 | 适用 | 主要问题 |
| --- | --- | --- |
| **A. 壳 + 包表（采用）** | 可叠加次数、多有效期、可退款 | 新表 + 准入中间件 + 计费事务扣次 |
| B. 仅包表、去掉壳 | 全新产品线 | 需改 `GetAvailableGroups` / Key 绑定整条链 |
| C. 单行加 `requests_used` | 一分组一商品、叠加只延时 | 无法「再买 N 次」；多有效期冲突 |
| D. USD 伪装次数 | 快速试点 | 倍率/并发/叠加语义全错 |

---

## 8. 与现有代码的挂载点

| 环节 | 现有位置 | 改造点 |
| --- | --- | --- |
| 兑换 | `internal/service/redeem_service.go` 订阅分支 | 同事务插包；拒绝对请求包分组使用负天数码 |
| 支付下单 | `payment_order.go` `createOrderInTx` | 快照 `request_count` / `models` |
| 支付履约 | `payment_fulfillment.go` `ensurePaymentSubscriptionAssigned` | `!alreadyAssigned` 分支内同事务插包 |
| 退款 | `payment_refund.go` `prepDeduct` / `ExecuteRefund` / 回滚点 | 包订单改为 revoke / restore 包，不缩短壳 |
| 鉴权壳 | `middleware/api_key_auth.go` | 无需改动 |
| 准入 | `middleware/group_model_allowlist.go` 之后 | 新增 `GroupRequestPack` 中间件；`routes/gateway.go` 挂载；WS 握手补查 |
| 扣次 | `usage_billing.go` `UsageBillingCommand`、`gateway_usage_billing.go` `buildUsageBillingCommand`、`repository/usage_billing_repo.go` `applyUsageBillingEffects` | 新增字段；事务内选包并扣次 |
| 错误 | `subscription_service.go` 错误定义处 | 新增 `ErrRequestQuotaExceeded` 并补错误映射 |
| Schema | `migrations/*.sql`、`ent/schema/*` | 新表 + 新字段；`make generate` |

---

## 9. 落地顺序

1. **数据层**：migration + ent schema（新表、`groups.request_pack_enabled`、plan / redeem / order 字段）。
2. **兑换发包** + 管理端生成码字段、分组开关。
3. **网关**：准入中间件 + `Apply` 内扣次 + 包缓存及失效。
4. **支付履约**：下单快照 + 同事务插包。
5. **退款**：包订单 revoke / restore（独立步骤，含回滚点测试）。
6. **用户端**：我的订阅展示包列表；文案明确「多次兑换加次数」。

测试重点：同一 `request_id` 重复落账只扣一次；多包 FIFO 与按模型匹配；支付履约重试不重复发包；退款失败回滚恢复包；分组关闭开关时行为不变。

---

## 10. 已确认的决策

| 事项 | 决策 |
| --- | --- |
| 叠加语义 | 多包累加次数 |
| 时间窗形态 | 买断包，不按日重置 |
| 上游失败是否退次 | 无需退：仅成功落账才扣次 |
| 壳过期策略 | 沿用 `AssignOrExtendSubscription`；展示取包最大过期时间 |
| 与 USD 双闸 | 首版不并存 |
| 「一次请求」口径 | 一次成功落账的 `RecordUsage`；图片/视频/语音按 1 次 |
| 限额强度 | 软限制，允许并发下少量超卖 |

---

## 11. 相关现有代码

- 分组字段：`backend/ent/schema/group.go`（`daily_limit_usd`、`rpm_limit`、`model_allowlist`）
- 用户订阅：`backend/ent/schema/user_subscription.go`
- 套餐：`backend/ent/schema/subscription_plan.go`
- 兑换码：`backend/ent/schema/redeem_code.go`
- 兑换逻辑：`backend/internal/service/redeem_service.go`
- 分配/续期：`backend/internal/service/subscription_service.go`（`AssignOrExtendSubscription`）
- 支付履约 / 退款：`backend/internal/service/payment_fulfillment.go`、`payment_refund.go`
- 模型白名单：`backend/internal/service/group_model_allowlist.go`、`backend/internal/server/middleware/group_model_allowlist.go`
- 计费落账：`backend/internal/service/gateway_usage_billing.go`、`usage_billing.go`、`backend/internal/repository/usage_billing_repo.go`

---

## 12. 示例

### 12.1 兑换码商品

- 分组：`【订阅】deepseek-v4.1-flash`（`request_pack_enabled = true`）
- 兑换码：`request_count=1000`，`models=["deepseek-v4.1-flash"]`，`validity_days=30`
- 用户兑一次 → 壳活跃 30 天 + Pack#1 剩余 1000
- 再兑一次（未过期）→ Pack#2 再 +1000；FIFO 先扣更早过期的包

### 12.2 「有效天数」与「兑换码过期」

生成兑换码弹窗中：

- **有效天数**：兑换成功后，请求包 / 订阅壳的可用时长。
- **兑换码过期**：码本身未使用前是否失效。

二者无关；分组上的 `default_validity_days` **不会**在兑换时截断兑换码上的 `validity_days`。
