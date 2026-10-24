export default {
  aboutAlphaio: {
    title: 'About AlphaIO',
    description: 'Explore AlphaIO data, research tools, AI integration and subscriptions.',
    eyebrow: 'ALPHAIO · DATA & QUANT RESEARCH',
    chart: { title: 'Daily candlestick chart', caption: 'After close · Daily · Illustration', note: 'OHLCV · Not real-time' },
    headline: 'A home for quantitative models',
    intro: 'Build a library of end-of-day quantitative data models, access model data APIs, and explore demo previews and examples—with dedicated per-minute quotas for each featureCode instead of a single globally shared rate limit.',
    reviewed: 'Based on the website review of October 24, 2026',
    website: 'Visit website ↗', models: 'Explore quant models', contents: 'On this page',
    source: 'Current product terms, account permissions and delivery status apply.',
    stats: { domains: 'Research domains', features: 'Hall features', apis: 'API doc entries', note: 'Counts reflect the review date. Products and APIs do not map one to one.' },
    sections: { capabilities: 'Capabilities', integration: 'Integration', ai: 'AI support', subscriptions: 'Subscriptions', service: 'Support & docs', boundaries: 'Before you start' },
    capabilitiesIntro: 'Choose from foundational datasets, end-of-day rules and separate intraday tools.',
    domains: {
      market: { title: 'Market fundamentals', body: 'Daily prices, indicators, adjustments, technical factors, price limits, suspensions, security details and trading calendars.' },
      capital: { title: 'Capital flows', body: 'Stock, Stock Connect and sector flows, plus sector strength rankings for rotation research.' },
      limit: { title: 'Price-limit patterns', body: 'Price-limit events, consecutive advances, strong sectors, trading disclosures and daily reviews.' },
      chips: { title: 'Cost distribution', body: 'Daily average holding costs and related profitability indicators for distribution analysis.' },
      index: { title: 'Indices & sectors', body: 'Index metadata, daily prices, THS sector directories and constituent lists.' },
      news: { title: 'News & themes', body: 'Headlines, financial news and theme lists with constituents and articles. Daily news is not a live order book.' },
      rules: { title: 'Strategy rules', body: 'Ten end-of-day rules covering pullbacks, bases, moving-average trends, leaders and post-limit patterns.' },
      tools: { title: 'Specialty tools', body: '智T引擎, 智T·QMT, 超级分时 and 龙头分时 offer separate intraday monitoring, alerts and execution connections.' }
    },
    integrationIntro: 'Validate definitions in the workspace, then connect scripts or AI workflows.',
    integrations: {
      web: { title: 'Web workspace', body: 'Browse demos and filters, then inspect schemas, variables and response fields in GraphiQL.', tag: 'Preview & debug' },
      graphql: { title: 'Shop GraphQL', body: 'Select fields and query conditions for research scripts, reports and automated workflows.', tag: 'Flexible queries' },
      rest: { title: 'RESTful API', body: 'Standard HTTP interfaces with parameter constraints, field units and examples in multiple languages.', tag: 'HTTP integration' },
      mcp: { title: 'MCP', body: 'Connect external agents over Streamable HTTP to use data tools within account permissions.', tag: 'Connect AI' }
    },
    integrationNote: 'APIs require credentials and channel: hps-quants. Subscriptions, preview windows and rate limits still apply to every integration.',
    docsLink: 'Read integration docs ↗',
    aiIntro: 'Research content and tools for external AI to work within your data permissions.',
    ai: {
      agent: { title: 'MCP · Skill · LLM Doc', body: 'Configuration guides cover Cursor, Codex, Claude Code, Trae and more. Skills define calling rules; LLM Docs explain APIs. Listed support has not been tested in every client.' },
      brief: { title: 'AI daily brief', body: 'DeepSeek or a configured LLM produces a five-part end-of-day summary sharing its content with Feishu. Docs show a monthly plan; generation and delivery depend on availability.' },
      hermes: { title: 'Hermes research reports', body: 'Compare symbols across technical, capital flow, sentiment, cost and risk dimensions. Asynchronous tasks use call packs; the page states successful calls are charged and failed calls are not.' }
    },
    subscriptionsIntro: 'Choose the billing unit that matches your work. One subscription does not unlock everything.',
    plans: {
      single: { title: 'Single API / model', unit: 'Term + dedicated quota', body: 'Subscribe by featureCode when your workflow needs only a few interfaces.' },
      bundle: { title: 'Data bundles', unit: 'Term + shared quota', body: 'Basic Data VIP lists 16 APIs, the sentiment bundle 5 and the cost distribution bundle 1. Check each product for its scope.' },
      slots: { title: 'Specialty tools', unit: 'Monthly slots', body: '2 / 4 / 6 / 8 / 10 / 12 concurrent symbol slots. Sold separately from standard data bundles.' },
      usage: { title: 'Hermes call packs', unit: 'Successful calls', body: 'Packs of 50 / 200 / 1000 calls can be combined. Purchase more when the balance runs out.' }
    },
    pricingTitle: 'Basic Data VIP · Reference prices',
    pricingNote: 'Plan-card snapshot from October 24, 2026, excluding account discounts. Economy/Standard show 240/480 calls per minute shared within the bundle. Checkout quota wording differs; confirm actual entitlements before buying.',
    period: 'Term', economy: 'Economy', standard: 'Standard', days: '{count} days',
    previewNote: 'Some features offer delayed previews or trials depending on the account and product. A preview is not full paid access.',
    plansLink: 'View features & plans ↗',
    supportTitle: 'AlphaIO operations support',
    supportHours: 'Weekdays 10:00–19:00 · Beijing time',
    supportBody: 'Help with subscriptions, quotas, accounts, model definitions and API integration. Include a redacted problem description and order reference when relevant.',
    supportLimit: 'QQ, email and an in-site support panel are available. No confirmed 24/7 or recovery SLA; no trading guidance.',
    contact: 'Contact official support ↗',
    documentationTitle: 'From introduction to API integration',
    documentationBody: 'Docs cover MCP / Skill setup, GraphQL schemas and workspaces, RESTful parameters and fields, multilingual examples, LLM Docs and rate-limit backoff.',
    documentationLimit: 'Suitable for evaluation and initial integration. Production use still needs credential lifecycle, compatibility, rate-limit and incident handling confirmation. Documentation coverage does not verify reliability.',
    boundaries: {
      scope: { title: 'Separate daily data from intraday tools', body: 'The homepage, FAQ and agreement emphasize end-of-day data, while specialty products describe minute-level signals and Feishu alerts. Confirm each product’s scope.' },
      qmt: { title: 'Confirm QMT delivery status', body: 'The product page still references a future Worker package and authentication release. Purchasable slots do not prove the execution component is released.' },
      quota: { title: 'Quota and bundle wording differs', body: 'MCP/Skill, API workspaces and plan pages show different limits. FAQ bundle statements also differ from the catalog. Confirm terms before purchasing.' }
    },
    disclaimer: 'Data, models, AI outputs and examples are for research only, not investment advice or a promise of returns. This page is based on documentation review; payments, paid analysis, brokerage integration and service SLAs were not tested.',
    agreement: 'Service agreement ↗', faq: 'FAQ ↗'
  }
}
