const copy = {
  en: {
    eyebrow: 'Documentation',
    title: 'Guides for connecting AlphaIO',
    titleEnd: 'to the tools you already use.',
    description:
      'Step-by-step docs for account, billing, Claude Code / Codex / Cursor setup, Agent skills, and image generation.',
    ctaDocs: 'Browse docs',
    ctaStart: 'Start here',
    ctaConsole: 'Open console',
    guidesLabel: 'Guides',
    guidesTitle: 'Everything covered in the docs.',
    guidesDescription:
      'Follow the pages below in order, or jump straight to the topic you need.',
    guides: [
      {
        slug: 'account/register',
        title: 'Account',
        description: 'Sign up or sign in with email, GitHub, or Google.',
      },
      {
        slug: 'billing/topup',
        title: 'Top up / Redeem',
        description: 'Get balance, then create an API Key for the right model group.',
      },
      {
        slug: 'tools/cc-switch',
        title: 'Tool setup',
        description:
          'Connect Claude Code, Codex, Cursor, DeepSeek Harness, and ZCode via CC Switch or native settings.',
      },
      {
        slug: 'ai/agent-skills',
        title: 'Agent skills',
        description: 'Install the AlphaIO image skill so Codex can generate and edit images in chat.',
      },
      {
        slug: 'image-generation',
        title: 'Image generation',
        description: 'Use Image Studio for text-to-image and reference-based editing.',
      },
      {
        slug: 'faq',
        title: 'FAQ',
        description: 'Fix timeout, routing, and Codex history issues when switching APIs.',
      },
    ],
    topicsLabel: 'What the docs cover',
    topicsTitle: 'Capabilities explained in the guides.',
    topics: [
      {
        id: 'relay',
        title: 'One key, many clients',
        description:
          'Use a single AlphaIO key across coding agents and IDEs—configure endpoint, protocol, and model per the setup guide.',
        slug: 'tools/cc-switch',
        action: 'Read tool setup',
      },
      {
        id: 'switch',
        title: 'CC Switch routing',
        description:
          'Add a provider, enable Route mode, and forward Claude Code or Codex traffic to AlphaIO without rewriting each app.',
        slug: 'tools/cc-switch',
        action: 'See CC Switch steps',
      },
      {
        id: 'skills',
        title: 'Agent image skills',
        description:
          'Download the skill pack, place it under ~/.agents/skills/, configure base_url and api_key, then restart Codex.',
        slug: 'ai/agent-skills',
        action: 'Install skills',
      },
      {
        id: 'studio',
        title: 'Web image studio',
        description:
          'Configure a provider, write prompts or attach references, then generate, preview, and download results.',
        slug: 'image-generation',
        action: 'Open image guide',
      },
    ],
    pathLabel: 'Suggested reading order',
    pathTitle: 'From account to first successful request.',
    pathSteps: [
      { n: '01', title: 'Register & sign in', slug: 'account/register' },
      { n: '02', title: 'Redeem / top up & create a key', slug: 'billing/topup' },
      { n: '03', title: 'Wire up your client', slug: 'tools/cc-switch' },
      { n: '04', title: 'Optional: skills & image studio', slug: 'ai/agent-skills' },
    ],
    closingTitle: 'Ready to connect?',
    closingDescription:
      'Open the getting-started guide, or jump into tool configuration if you already have an API Key.',
    footerNav: 'Footer',
    footerDocs: 'Documentation',
    footerConsole: 'Console',
    footerQuant: 'Quant site',
    footerKeyUsage: 'Key usage lookup',
    copyright: (year: number, name: string) => `© ${year} ${name}`,
  },
  cn: {
    eyebrow: '使用文档',
    title: '把 AlphaIO',
    titleEnd: '接到你正在用的工具。',
    description:
      '文档覆盖账号管理、充值兑换与创建 Key、Claude Code / Codex / Cursor 等接入、Agent 技能与图片生成。',
    ctaDocs: '浏览文档',
    ctaStart: '从这里开始',
    ctaConsole: '打开控制台',
    guidesLabel: '文档目录',
    guidesTitle: '文档里有这些内容。',
    guidesDescription: '建议按顺序阅读，也可以直接进入你需要的主题。',
    guides: [
      {
        slug: 'account/register',
        title: '账号管理',
        description: '使用邮箱、GitHub 或 Google 完成注册与登录。',
      },
      {
        slug: 'billing/topup',
        title: '充值/兑换',
        description: '获取额度，并创建匹配目标模型分组的 API Key。',
      },
      {
        slug: 'tools/cc-switch',
        title: '工具配置',
        description:
          '通过 CC Switch 或原生设置接入 Claude Code、Codex、Cursor、DeepSeek Harness、ZCode 等。',
      },
      {
        slug: 'ai/agent-skills',
        title: 'Agent 技能',
        description: '安装 AlphaIO 图片技能，在 Codex 对话中直接生图与改图。',
      },
      {
        slug: 'image-generation',
        title: '图片生成',
        description: '在图片工作室中完成文生图与参考图编辑。',
      },
      {
        slug: 'faq',
        title: '常见问题',
        description: '排查超时、路由未生效、切换 API 后 Codex 历史等问题。',
      },
    ],
    topicsLabel: '文档涵盖的能力',
    topicsTitle: '指南中说明的能力。',
    topics: [
      {
        id: 'relay',
        title: '一钥多用',
        description:
          '同一 AlphaIO Key 可接入多种编程助手与 IDE；按工具配置文档填写地址、协议与模型。',
        slug: 'tools/cc-switch',
        action: '阅读工具配置',
      },
      {
        id: 'switch',
        title: 'CC Switch 路由',
        description:
          '添加供应商、启用路由模式，将 Claude Code / Codex 流量转发到 AlphaIO，无需逐个改客户端。',
        slug: 'tools/cc-switch',
        action: '查看 CC Switch 步骤',
      },
      {
        id: 'skills',
        title: 'Agent 图片技能',
        description:
          '下载技能包放到 ~/.agents/skills/，配置 base_url 与 api_key，重启 Codex 即可使用。',
        slug: 'ai/agent-skills',
        action: '安装技能',
      },
      {
        id: 'studio',
        title: '网页图片工作室',
        description: '配置供应商、填写提示词或上传参考图，生成后预览与下载。',
        slug: 'image-generation',
        action: '打开图片指南',
      },
    ],
    pathLabel: '建议阅读顺序',
    pathTitle: '从账号到第一次成功请求。',
    pathSteps: [
      { n: '01', title: '注册并登录', slug: 'account/register' },
      { n: '02', title: '兑换／充值并创建 Key', slug: 'billing/topup' },
      { n: '03', title: '接入客户端', slug: 'tools/cc-switch' },
      { n: '04', title: '可选：技能与图片工作室', slug: 'ai/agent-skills' },
    ],
    closingTitle: '准备开始接入？',
    closingDescription: '打开快速开始，或如果你已有 API Key，直接进入工具配置。',
    footerNav: '页脚导航',
    footerDocs: '使用文档',
    footerConsole: '控制台',
    footerQuant: '量化主站',
    footerKeyUsage: 'Key 用量查询',
    copyright: (year: number, name: string) => `© ${year} ${name}`,
  },
} as const;

export function getHomeCopy(locale: string) {
  return locale === 'cn' ? copy.cn : copy.en;
}
