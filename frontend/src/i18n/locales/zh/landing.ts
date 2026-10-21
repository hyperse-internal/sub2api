export default {
  batchImageGuide: {
    title: '图片批量生成',
    description: '一次提交多条提示词，任务完成后可统一下载图片结果'
  },
  // Home Page
  home: {
    builtin: {
      skipContent: '跳转到主要内容',
      navigation: '首页导航',
      footerNavigation: '页脚导航',
      menu: '展开或收起导航',
      theme: '外观模式',
      capabilitiesNav: '产品能力',
      docs: '使用文档',
      createAccount: '创建账户',
      loginToStart: '登录使用',
      existingLogin: '已有账户？登录',
      eyebrow: 'AI 模型 API 接入服务',
      title: '为你的工具与应用，',
      titleEnd: '接入所需 AI 模型。',
      description: '按需求选择模型与分组，通过 API Key 接入 AI 工具和应用，在控制台管理密钥、查询调用用量与费用。',
      descriptionSimple: '按需求选择模型与分组，通过 API Key 接入 AI 工具和应用，在控制台管理密钥与使用权限。',
      guide: '查看接入指南',
      flowLabel: '模型接入流程示意',
      flow: {
        models: '选择模型与分组',
        group: '目标模型分组',
        permissions: '确认可用权限',
        modelsNote: '根据使用需求，选择对应分组。',
        key: '创建 API Key',
        keyNote: '为你的项目创建专属密钥。',
        connect: '接入工具或应用',
        tool: 'AI 编程工具',
        app: '你的应用',
        connectNote: '按指南配置地址、协议与模型。'
      },
      tags: { models: '模型与分组选择', keys: 'API Key 管理', usage: '用量与费用查询' },
      capabilitiesTitle: '从模型接入，到日常使用管理。',
      capabilitiesDescription: '让接入、管理与使用，都有清晰的路径。',
      capabilities: {
        tools: { title: '接入 AI 编程工具', description: '按工具要求配置 API 地址、协议和 Key，在现有工作流程中使用可用模型。', action: '查看工具配置' },
        keys: { title: '为应用接入模型', description: '为不同项目创建 API Key，按分组选择可用模型，并在控制台管理使用权限。', action: '管理 API Key' },
        usage: { title: '查看用量与费用', description: '在控制台查看调用记录、Token 用量与费用明细，了解项目的实际消耗。', action: '查看用量' }
      },
      modelsLabel: '模型与权限',
      modelsCostsLabel: '模型与费用',
      modelsTitle: '先了解模型与费用，再开始使用。',
      modelsTitleSimple: '选择适合你的模型与分组。',
      modelsDescription: '在模型广场查看分组、模型与价格说明，结合自己的使用需求选择接入方式。登录后可查看账号对应的信息。',
      modelsDescriptionSimple: '在模型广场了解模型与分组，结合自己的使用需求选择接入方式。',
      modelsClosed: '登录控制台，查看当前可用分组与站点开放的使用方式。',
      modelRights: '可用模型以当前分组和账号权限为准。',
      usageNote: '在控制台查看调用记录、Token 用量与费用明细。',
      quota: '获取使用额度',
      viewModels: '查看模型与价格',
      loginForModels: '登录查看模型与价格',
      viewModelsSimple: '查看模型与分组',
      loginForModelsSimple: '登录查看模型与分组',
      billing: {
        recharge_and_subscription: { action: '充值／订阅', description: '充值余额或选择订阅，按自己的使用需求安排额度。' },
        recharge_only: { action: '账户充值', description: '充值余额，按实际使用情况查看消耗。' },
        subscription_only: { action: '查看订阅', description: '选择适合的订阅，查看对应分组与使用额度。' },
        closed: '可用额度与开通方式以控制台和站点说明为准。'
      },
      stepsLabel: '开始接入',
      stepsTitle: '三步，完成第一次使用。',
      steps: {
        accountTitle: '登录账户，准备额度',
        existingAccount: '登录已有账户',
        login: '登录账户',
        accountDescription: '创建或登录账户，按站点开放方式准备可用额度。',
        existingDescription: '登录账户，按站点开放方式准备可用额度。',
        accountSimple: '登录账户，进入控制台管理你的 API Key。',
        accountAction: '进入账户',
        keyTitle: '选择分组，创建 Key',
        keyDescription: '在 API 密钥页面选择目标模型对应的分组，创建并保存自己的 Key。',
        keyAction: '管理 API Key',
        connectTitle: '接入工具，开始使用',
        connectDescription: '按指南配置 API 地址、协议、Key 和模型，完成首次调用。',
        connectAction: '查看接入指南'
      },
      additionalTools: '按需使用的附加工具',
      imageTitle: '图像工作室',
      imageDescription: '使用账号下可用的图像模型，在网页中生成、编辑并下载图片。',
      imagePermissions: '需有支持图像生成的有效 API Key，具体模型与编辑能力以账号可用列表为准。',
      openTool: '打开工具',
      loginForTool: '登录后使用',
      faqLabel: '常见问题',
      faqTitle: '开始之前，你可能想了解。',
      faq: {
        modelsQuestion: '一个 API Key 可以调用所有模型吗？',
        modelsAnswer: '不一定。Key 绑定的分组决定可用模型与权限，请根据目标模型选择对应分组。不同需求可以分别创建 Key。',
        toolsQuestion: '如何接入已有工具？',
        toolsAnswer: '在使用文档中找到对应工具，按要求填写 API 地址、协议、Key 和模型。不同工具的配置方式可能不同。',
        costQuestion: '去哪里了解价格和消耗？',
        plazaAnswer: '可以在模型广场查看模型与价格说明。',
        costAnswer: '登录后可在用量记录中查看自己的调用与费用。实际费用以当前分组、计费规则和使用记录为准。',
        errorsQuestion: '请求失败或无法连接怎么办？',
        errorsAnswer: '检查 API 地址、协议、Key、分组和可用额度，再查看文档中的排障说明。',
        errorsSimple: '检查 API 地址、协议、Key 和分组，再查看文档中的排障说明。',
        support: '仍无法解决时，可通过页脚的联系信息联系站点支持。'
      },
      moreHelp: '查看更多帮助',
      closingTitle: '从你的第一个 API Key 开始。',
      closingDescription: '登录控制台，选择适合的模型分组，为你的工具与应用创建 API Key。',
      keyUsage: 'Key 用量查询',
      contact: '联系支持'
    },
    viewOnGithub: '在 GitHub 上查看',
    viewDocs: '查看文档',
    docs: '文档',
    switchToLight: '切换到浅色模式',
    switchToDark: '切换到深色模式',
    dashboard: '控制台',
    login: '登录',
    getStarted: '立即开始',
    goToDashboard: '进入控制台',
    // 新增：面向用户的价值主张
    heroSubtitle: '一个密钥，畅用多个 AI 模型',
    heroDescription: '无需管理多个订阅账号，一站式接入 Claude、GPT、Gemini 等主流 AI 服务',
    tags: {
      subscriptionToApi: '订阅转 API',
      stickySession: '会话保持',
      realtimeBilling: '按量计费'
    },
    // 用户痛点区块
    painPoints: {
      title: '你是否也遇到这些问题？',
      items: {
        expensive: {
          title: '订阅费用高',
          desc: '每个 AI 服务都要单独订阅，每月支出越来越多'
        },
        complex: {
          title: '多账号难管理',
          desc: '不同平台的账号、密钥分散各处，管理起来很麻烦'
        },
        unstable: {
          title: '服务不稳定',
          desc: '单一账号容易触发限制，影响正常使用'
        },
        noControl: {
          title: '用量无法控制',
          desc: '不知道钱花在哪了，也无法限制团队成员的使用'
        }
      }
    },
    // 解决方案区块
    solutions: {
      title: '我们帮你解决',
      subtitle: '简单三步，开始省心使用 AI'
    },
    features: {
      unifiedGateway: '一键接入',
      unifiedGatewayDesc: '获取一个 API 密钥，即可调用所有已接入的 AI 模型，无需分别申请。',
      multiAccount: '稳定可靠',
      multiAccountDesc: '智能调度多个上游账号，自动切换和负载均衡，告别频繁报错。',
      balanceQuota: '用多少付多少',
      balanceQuotaDesc: '按实际使用量计费，支持设置配额上限，团队用量一目了然。'
    },
    // 优势对比
    comparison: {
      title: '为什么选择我们？',
      headers: {
        feature: '对比项',
        official: '官方订阅',
        us: '本平台'
      },
      items: {
        pricing: {
          feature: '付费方式',
          official: '固定月费，用不完也付',
          us: '按量付费，用多少付多少'
        },
        models: {
          feature: '模型选择',
          official: '单一服务商',
          us: '多模型随意切换'
        },
        management: {
          feature: '账号管理',
          official: '每个服务单独管理',
          us: '统一密钥，一站管理'
        },
        stability: {
          feature: '服务稳定性',
          official: '单账号易触发限制',
          us: '多账号池，自动切换'
        },
        control: {
          feature: '用量控制',
          official: '无法限制',
          us: '可设配额、查明细'
        }
      }
    },
    providers: {
      title: '已支持的 AI 模型',
      description: '一个 API，多种选择',
      supported: '已支持',
      soon: '即将推出',
      claude: 'Claude',
      gemini: 'Gemini',
      antigravity: 'Antigravity',
      more: '更多'
    },
    // CTA 区块
    cta: {
      title: '准备好开始了吗？',
      description: '注册即可获得免费试用额度，体验一站式 AI 服务',
      button: '免费注册'
    },
    footer: {
      allRightsReserved: '保留所有权利。'
    }
  },

  // Key Usage Query Page
  keyUsage: {
    title: 'API Key 用量查询',
    subtitle: '输入您的 API Key 以查看实时消费金额与使用状态',
    placeholder: 'sk-ant-mirror-xxxxxxxxxxxx',
    query: '查询',
    querying: '查询中...',
    privacyNote: '您的 Key 仅在浏览器本地处理，不会被存储',
    dateRange: '统计范围:',
    dateRangeToday: '今日',
    dateRange7d: '7 天',
    dateRange30d: '30 天',
    dateRange90d: '90 天',
    dateRangeCustom: '自定义',
    apply: '应用',
    used: '已使用',
    detailInfo: '详细信息',
    tokenStats: 'Token 统计',
    dailyDetail: '按日明细',
    modelStats: '模型用量统计',
    // Table headers
    date: '日期',
    model: '模型',
    requests: '请求数',
    inputTokens: '输入 Tokens',
    outputTokens: '输出 Tokens',
    cacheCreationTokens: '缓存创建',
    cacheReadTokens: '缓存读取',
    cacheWriteTokens: '缓存写入',
    totalTokens: '总 Tokens',
    cost: '费用',
    // Status
    quotaMode: 'Key 限额模式',
    walletBalance: '钱包余额',
    // Ring card titles
    totalQuota: '总额度',
    limit5h: '5 小时限额',
    limitDaily: '日限额',
    limit7d: '7 天限额',
    limitWeekly: '周限额',
    limitMonthly: '月限额',
    // Detail rows
    remainingQuota: '剩余额度',
    expiresAt: '过期时间',
    todayExpires: '(今日到期)',
    daysLeft: '({days} 天)',
    usedQuota: '已用额度',
    resetNow: '即将重置',
    subscriptionType: '订阅类型',
    billingType: '计费方式',
    subscriptionExpires: '订阅到期',
    // Usage stat cells
    todayRequests: '今日请求',
    todayInputTokens: '今日输入',
    todayOutputTokens: '今日输出',
    todayTokens: '今日 Tokens',
    todayCacheCreation: '今日缓存创建',
    todayCacheRead: '今日缓存读取',
    todayCost: '今日费用',
    rpmTpm: 'RPM / TPM',
    totalRequests: '累计请求',
    totalInputTokens: '累计输入',
    totalOutputTokens: '累计输出',
    totalTokensLabel: '累计 Tokens',
    totalCacheCreation: '累计缓存创建',
    totalCacheRead: '累计缓存读取',
    totalCost: '累计费用',
    avgDuration: '平均耗时',
    // Messages
    enterApiKey: '请输入 API Key',
    querySuccess: '查询成功',
    queryFailed: '查询失败',
    queryFailedRetry: '查询失败，请稍后重试',
    noDailyUsage: '暂无按日用量数据',
  },

  // Setup Wizard
  setup: {
    title: 'Sub2API 安装向导',
    description: '配置您的 Sub2API 实例',
    database: {
      title: '数据库配置',
      description: '连接到您的 PostgreSQL 数据库',
      host: '主机',
      port: '端口',
      username: '用户名',
      password: '密码',
      databaseName: '数据库名称',
      sslMode: 'SSL 模式',
      passwordPlaceholder: '密码',
      ssl: {
        disable: '禁用',
        require: '要求',
        verifyCa: '验证 CA',
        verifyFull: '完全验证'
      }
    },
    redis: {
      title: 'Redis 配置',
      description: '连接到您的 Redis 服务器',
      host: '主机',
      port: '端口',
      username: '用户名（可选）',
      password: '密码（可选）',
      database: '数据库',
      usernamePlaceholder: '默认用户留空',
      passwordPlaceholder: '密码',
      enableTls: '启用 TLS',
      enableTlsHint: '连接 Redis 时使用 TLS（公共 CA 证书）'
    },
    admin: {
      title: '管理员账户',
      description: '创建您的管理员账户',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      passwordPlaceholder: '至少 8 个字符',
      confirmPasswordPlaceholder: '确认密码',
      passwordMismatch: '密码不匹配'
    },
    ready: {
      title: '准备安装',
      description: '检查您的配置并完成安装',
      database: '数据库',
      redis: 'Redis',
      adminEmail: '管理员邮箱'
    },
    status: {
      testing: '测试中...',
      success: '连接成功',
      testConnection: '测试连接',
      installing: '安装中...',
      completeInstallation: '完成安装',
      completed: '安装完成！',
      redirecting: '正在跳转到登录页面...',
      restarting: '服务正在重启，请稍候...',
      timeout: '服务重启时间超出预期，请手动刷新页面。'
    }
  },

  // Common
}
