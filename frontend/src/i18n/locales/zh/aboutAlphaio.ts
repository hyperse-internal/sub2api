export default {
  aboutAlphaio: {
    title: '关于 AlphaIO',
    description: '了解 AlphaIO 的量化数据、研究工具、AI 接入与订阅服务。',
    eyebrow: 'ALPHAIO · 数据与量化研究',
    chart: { title: '日K 柱状图', caption: '收盘后 · 日频 · 示意', note: 'OHLCV · 非实时' },
    headline: '量化模型沉淀平台',
    intro: '沉淀盘后量化数据模型，开放模型数据 API，并提供 demo 预览与案例参考——按 featureCode 独享分钟配额，告别行业式全局共享速率。',
    reviewed: '依据 2026 年 10 月 24 日官网调研整理',
    website: '访问官网 ↗',
    models: '探索量化模型',
    contents: '本页导航',
    source: '以官网当前商品说明、实际授权与交付状态为准。',
    stats: { domains: '研究领域', features: '大厅功能项', apis: 'API 文档入口', note: '数量为调研时快照；商品与 API 并非一一对应。' },
    sections: { capabilities: '功能版图', integration: '对接方式', ai: 'AI 支持', subscriptions: '订阅模式', service: '服务与文档', boundaries: '使用须知' },
    capabilitiesIntro: '覆盖基础数据、盘后规则与独立盘中工具，按研究场景选择能力。',
    domains: {
      market: { title: '行情基础', body: '日线、每日指标、复权因子、技术因子、涨跌停价、停复牌、股票信息与交易日历。' },
      capital: { title: '资金流向', body: '个股与沪深港通资金、板块资金流向和强度排行，辅助观察资金结构与轮动。' },
      limit: { title: '涨停连板', body: '涨跌停与炸板、连板晋级、最强板块、龙虎榜和涨停复盘日榜。' },
      chips: { title: '筹码成本', body: '每日筹码平均成本与胜率相关数据，用于研究成本结构与筹码变化。' },
      index: { title: '指数板块', body: '指数基础信息、指数日线、同花顺板块目录与概念成分。' },
      news: { title: '资讯情报', body: '市场头条、财经快讯及题材列表、成分股与正文；日更资讯不等于实时盘口。' },
      rules: { title: '策略规则', body: '十类盘后规则，覆盖极点回踩、底部整理、均线趋势、龙头与涨停后结构。' },
      tools: { title: '特色工具', body: '智T引擎、智T·QMT、超级分时、龙头分时，独立提供盘中观察、提醒与执行衔接。' }
    },
    integrationIntro: '从网页验证口径，再选择适合脚本或 AI 工作流的接入方式。',
    integrations: {
      web: { title: '网页工作区', body: '查看 Demo、筛选数据，通过 GraphiQL 浏览 Schema、变量和返回字段。', tag: '预览与调试' },
      graphql: { title: 'Shop GraphQL', body: '按需选择字段与查询条件，适合研究脚本、报表和自动化流水线。', tag: '灵活查询' },
      rest: { title: 'RESTful API', body: '标准 HTTP 接口，文档提供参数约束、字段单位和多语言调用示例。', tag: '跨语言集成' },
      mcp: { title: 'MCP', body: '通过 Streamable HTTP 连接外部 Agent，在账户授权范围内调用数据工具。', tag: '连接 AI' }
    },
    integrationNote: 'API 需携带授权凭证与 channel: hps-quants。订阅、预览窗口和限流对所有接入方式仍然生效。',
    docsLink: '查看接入文档 ↗',
    aiIntro: '既提供研究内容，也让外部 AI 安全地使用已有数据权限。',
    ai: {
      agent: { title: 'MCP · Skill · LLM Doc', body: '提供 Cursor、Codex、Claude Code、Trae 等客户端配置说明；Skill 固化调用规则，LLM Doc 帮助模型理解接口。支持说明不等于逐个客户端已实测。' },
      brief: { title: 'AI 每日总结', body: 'DeepSeek 或配置的 LLM 生成盘后五段式市场总结，与飞书正文同源。文档显示月卡订阅，实际生成与推送以产品开放状态为准。' },
      hermes: { title: 'Hermes 专业投研报告', body: '技术、资金、情绪、筹码、风险五维评分与多标的比较。按次数包使用，异步任务可回看；页面说明成功扣次、失败不扣次。' }
    },
    subscriptionsIntro: '按使用对象选择计费单位，不是购买一个会员就解锁全部能力。',
    plans: {
      single: { title: '单 API / 单模型', unit: '期限 + 独立配额', body: '按 featureCode 单独开通，适合只需要少数接口的研究任务。' },
      bundle: { title: '数据包', unit: '期限 + 包内共享', body: '基础数据 VIP 含 16 个子 API，情绪连板包含 5 个，筹码包含 1 个；范围以商品页为准。' },
      slots: { title: '特色工具', unit: '槽位月付', body: '2 / 4 / 6 / 8 / 10 / 12 个并发标的槽位，独立售卖，不默认包含在普通数据包中。' },
      usage: { title: 'Hermes 次数包', unit: '按成功调用次数', body: '50 / 200 / 1000 次包可叠加购买，余额耗尽后需补充。' }
    },
    pricingTitle: '基础数据 VIP · 标价参考',
    pricingNote: '2026-10-24 方案卡快照，不含账号优惠。经济/标准档标示 240/480 次每分钟，包内共享；结算摘要存在配额文案差异，购买前请确认实际权益。',
    period: '周期', economy: '经济档', standard: '标准档', days: '{count} 天',
    previewNote: '部分功能有滞后预览或试用，资格按账号与产品判断；预览可用不代表完整付费权限。',
    plansLink: '查看功能与套餐 ↗',
    supportTitle: 'AlphaIO 运维支持',
    supportHours: '工作日 10:00–19:00 · 北京时间',
    supportBody: '协助订阅、配额、账号、模型口径与 API 接入。复杂问题可附脱敏的问题说明与订单号。',
    supportLimit: '提供 QQ、邮箱和站内售后面板；未确认 7×24 或故障恢复 SLA，不提供交易指导。',
    contact: '联系官方支持 ↗',
    documentationTitle: '从入门到接口联调',
    documentationBody: '文档包含 MCP / Skill 配置、GraphQL Schema 与工作区、RESTful 参数和字段说明、多语言示例、LLM Doc 及限流退避提示。',
    documentationLimit: '适合产品理解和初步联调。生产接入仍需确认长期凭证、版本兼容、实际限流与故障处理；文档齐全不等于服务可靠性已验证。',
    boundaries: {
      scope: { title: '盘后数据与盘中工具分开理解', body: '首页、FAQ 和协议偏向盘后定位，特色商品已描述分钟信号与飞书推送；具体范围应以对应产品确认。' },
      qmt: { title: 'QMT 交付状态需确认', body: '产品页仍提示 Worker 包与鉴权上线后形成完整交付。可购买槽位不等于执行组件已经发布。' },
      quota: { title: '配额与套餐口径有差异', body: 'MCP/Skill、API 工作区与套餐页的限流数字不同；FAQ 的组合包表述也与在售数据包不一致。请在购买前核对。' }
    },
    disclaimer: '数据、模型、AI 输出与示例仅供研究参考，不构成投资建议或收益承诺。本页基于文档调研，未实测支付、付费分析、券商链路或服务 SLA。',
    agreement: '服务协议 ↗', faq: '常见问题 ↗'
  }
}
