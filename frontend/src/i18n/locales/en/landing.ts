export default {
  batchImageGuide: {
    title: 'Batch Image Generation',
    description: 'Submit multiple prompts in one job and download the generated images when complete'
  },
  // Home Page
  home: {
    builtin: {
      skipContent: 'Skip to main content',
      navigation: 'Home navigation',
      footerNavigation: 'Footer navigation',
      menu: 'Toggle navigation',
      theme: 'Appearance',
      capabilitiesNav: 'Capabilities',
      docs: 'Documentation',
      createAccount: 'Create account',
      loginToStart: 'Sign in to start',
      existingLogin: 'Already have an account? Sign in',
      eyebrow: 'AI model API access',
      title: 'Your tools. Your applications.',
      titleEnd: 'The AI models you need.',
      description: 'Choose models and groups, connect your tools and applications with API keys, and manage keys, usage and costs in your dashboard.',
      descriptionSimple: 'Choose models and groups, connect your tools and applications with API keys, and manage keys and permissions in your dashboard.',
      guide: 'Read the setup guide',
      flowLabel: 'Model connection workflow illustration',
      flow: {
        models: 'Choose models and groups',
        group: 'Target model group',
        permissions: 'Check available permissions',
        modelsNote: 'Choose the group that fits your needs.',
        key: 'Create an API key',
        keyNote: 'A dedicated key for your project.',
        connect: 'Connect tools or apps',
        tool: 'AI coding tools',
        app: 'Your application',
        connectNote: 'Configure the endpoint, protocol and model.'
      },
      tags: { models: 'Models and groups', keys: 'API key management', usage: 'Usage and costs' },
      capabilitiesTitle: 'From model access to everyday management.',
      capabilitiesDescription: 'A clear path to connecting, managing and using your models.',
      capabilities: {
        tools: { title: 'Connect AI coding tools', description: 'Configure the API endpoint, protocol and key for your tool, then use available models in your existing workflow.', action: 'Configure your tools' },
        keys: { title: 'Bring models to your app', description: 'Create API keys for each project, select models by group, and manage access in your dashboard.', action: 'Manage API keys' },
        usage: { title: 'Understand usage and costs', description: 'Review requests, token usage and billing details in your dashboard to understand actual consumption.', action: 'View usage' }
      },
      modelsLabel: 'Models and permissions',
      modelsCostsLabel: 'Models and costs',
      modelsTitle: 'Understand the models and costs before you start.',
      modelsTitleSimple: 'Find the models and groups that fit.',
      modelsDescription: 'Explore groups, models and pricing in the model plaza. Choose an approach that fits your needs and sign in for account-specific information.',
      modelsDescriptionSimple: 'Explore models and groups in the model plaza and choose the access that fits your needs.',
      modelsClosed: 'Sign in to your dashboard to see available groups and the access options offered by this site.',
      modelRights: 'Available models depend on your group and account permissions.',
      usageNote: 'Review request history, token usage and billing details in your dashboard.',
      quota: 'Prepare your quota',
      viewModels: 'Explore models and pricing',
      loginForModels: 'Sign in for models and pricing',
      viewModelsSimple: 'Explore models and groups',
      loginForModelsSimple: 'Sign in for models and groups',
      billing: {
        recharge_and_subscription: { action: 'Top up / Subscribe', description: 'Top up your balance or choose a subscription to match your usage needs.' },
        recharge_only: { action: 'Top up balance', description: 'Top up your balance and track your actual consumption.' },
        subscription_only: { action: 'View subscriptions', description: 'Choose a suitable subscription and review its groups and usage allowance.' },
        closed: 'Check your dashboard and site instructions for quota and activation options.'
      },
      stepsLabel: 'Getting connected',
      stepsTitle: 'Three steps to your first request.',
      steps: {
        accountTitle: 'Sign in and prepare quota',
        existingAccount: 'Sign in to your account',
        login: 'Sign in',
        accountDescription: 'Create an account or sign in, then prepare quota using the options available on this site.',
        existingDescription: 'Sign in and prepare quota using the options available on this site.',
        accountSimple: 'Sign in to manage your API keys in the dashboard.',
        accountAction: 'Open your account',
        keyTitle: 'Choose a group, create a key',
        keyDescription: 'Select the group for your target model on the API keys page, then create and save your key.',
        keyAction: 'Manage API keys',
        connectTitle: 'Connect and start using',
        connectDescription: 'Follow the guide to configure the API endpoint, protocol, key and model, then make your first request.',
        connectAction: 'Read the setup guide'
      },
      additionalTools: 'Optional tools',
      imageTitle: 'Image studio',
      imageDescription: 'Generate, edit and download images in your browser using image models available to your account.',
      imagePermissions: 'Requires a valid API key with image access. Models and editing features depend on your account permissions.',
      openTool: 'Open tool',
      loginForTool: 'Sign in to use',
      faqLabel: 'Frequently asked questions',
      faqTitle: 'A few things to know before you start.',
      faq: {
        modelsQuestion: 'Can one API key access every model?',
        modelsAnswer: 'Not necessarily. The group linked to your key determines model access and permissions. Choose a group for your target model and create separate keys for different needs.',
        toolsQuestion: 'How do I connect an existing tool?',
        toolsAnswer: 'Find your tool in the documentation and configure its API endpoint, protocol, key and model. Setup varies between tools.',
        costQuestion: 'Where can I find pricing and consumption?',
        plazaAnswer: 'The model plaza provides model and pricing information.',
        costAnswer: 'Sign in to view your own requests and costs in usage history. Actual costs depend on the group, billing rules and usage records.',
        errorsQuestion: 'What if a request fails or cannot connect?',
        errorsAnswer: 'Check the API endpoint, protocol, key, group and available quota, then consult the troubleshooting documentation.',
        errorsSimple: 'Check the API endpoint, protocol, key and group, then consult the troubleshooting documentation.',
        support: 'If the issue persists, use the contact information in the footer to reach site support.'
      },
      moreHelp: 'Find more help',
      closingTitle: 'Start with your first API key.',
      closingDescription: 'Sign in, choose a suitable model group, and create an API key for your tools and applications.',
      keyUsage: 'Key usage lookup',
      contact: 'Contact support'
    },
    viewOnGithub: 'View on GitHub',
    viewDocs: 'View Documentation',
    docs: 'Docs',
    switchToLight: 'Switch to Light Mode',
    switchToDark: 'Switch to Dark Mode',
    dashboard: 'Dashboard',
    login: 'Login',
    getStarted: 'Get Started',
    goToDashboard: 'Go to Dashboard',
    // User-focused value proposition
    heroSubtitle: 'One Key, All AI Models',
    heroDescription: 'No need to manage multiple subscriptions. Access Claude, GPT, Gemini and more with a single API key',
    tags: {
      subscriptionToApi: 'Subscription to API',
      stickySession: 'Session Persistence',
      realtimeBilling: 'Pay As You Go'
    },
    // Pain points section
    painPoints: {
      title: 'Sound Familiar?',
      items: {
        expensive: {
          title: 'High Subscription Costs',
          desc: 'Paying for multiple AI subscriptions that add up every month'
        },
        complex: {
          title: 'Account Chaos',
          desc: 'Managing scattered accounts and API keys across different platforms'
        },
        unstable: {
          title: 'Service Interruptions',
          desc: 'Single accounts hitting rate limits and disrupting your workflow'
        },
        noControl: {
          title: 'No Usage Control',
          desc: "Can't track where your money goes or limit team member usage"
        }
      }
    },
    // Solutions section
    solutions: {
      title: 'We Solve These Problems',
      subtitle: 'Three simple steps to stress-free AI access'
    },
    features: {
      unifiedGateway: 'One-Click Access',
      unifiedGatewayDesc: 'Get a single API key to call all connected AI models. No separate applications needed.',
      multiAccount: 'Always Reliable',
      multiAccountDesc: 'Smart routing across multiple upstream accounts with automatic failover. Say goodbye to errors.',
      balanceQuota: 'Pay What You Use',
      balanceQuotaDesc: 'Usage-based billing with quota limits. Full visibility into team consumption.'
    },
    // Comparison section
    comparison: {
      title: 'Why Choose Us?',
      headers: {
        feature: 'Comparison',
        official: 'Official Subscriptions',
        us: 'Our Platform'
      },
      items: {
        pricing: {
          feature: 'Pricing',
          official: 'Fixed monthly fee, pay even if unused',
          us: 'Pay only for what you use'
        },
        models: {
          feature: 'Model Selection',
          official: 'Single provider only',
          us: 'Switch between models freely'
        },
        management: {
          feature: 'Account Management',
          official: 'Manage each service separately',
          us: 'Unified key, one dashboard'
        },
        stability: {
          feature: 'Stability',
          official: 'Single account rate limits',
          us: 'Multi-account pool, auto-failover'
        },
        control: {
          feature: 'Usage Control',
          official: 'Not available',
          us: 'Quotas & detailed analytics'
        }
      }
    },
    providers: {
      title: 'Supported AI Models',
      description: 'One API, Multiple Choices',
      supported: 'Supported',
      soon: 'Soon',
      claude: 'Claude',
      gemini: 'Gemini',
      antigravity: 'Antigravity',
      more: 'More'
    },
    // CTA section
    cta: {
      title: 'Ready to Get Started?',
      description: 'Sign up now and get free trial credits to experience seamless AI access',
      button: 'Sign Up Free'
    },
    footer: {
      allRightsReserved: 'All rights reserved.'
    }
  },

  // Key Usage Query Page
  keyUsage: {
    title: 'API Key Usage',
    subtitle: 'Enter your API Key to view real-time spending and usage status',
    placeholder: 'sk-ant-mirror-xxxxxxxxxxxx',
    query: 'Query',
    querying: 'Querying...',
    privacyNote: 'Your Key is processed locally in the browser and will not be stored',
    dateRange: 'Date Range:',
    dateRangeToday: 'Today',
    dateRange7d: '7 Days',
    dateRange30d: '30 Days',
    dateRange90d: '90 Days',
    dateRangeCustom: 'Custom',
    apply: 'Apply',
    used: 'Used',
    detailInfo: 'Detail Information',
    tokenStats: 'Token Statistics',
    dailyDetail: 'Daily Detail',
    modelStats: 'Model Usage Statistics',
    // Table headers
    date: 'Date',
    model: 'Model',
    requests: 'Requests',
    inputTokens: 'Input Tokens',
    outputTokens: 'Output Tokens',
    cacheCreationTokens: 'Cache Creation',
    cacheReadTokens: 'Cache Read',
    cacheWriteTokens: 'Cache Write',
    totalTokens: 'Total Tokens',
    cost: 'Cost',
    // Status
    quotaMode: 'Key Quota Mode',
    walletBalance: 'Wallet Balance',
    // Ring card titles
    totalQuota: 'Total Quota',
    limit5h: '5-Hour Limit',
    limitDaily: 'Daily Limit',
    limit7d: '7-Day Limit',
    limitWeekly: 'Weekly Limit',
    limitMonthly: 'Monthly Limit',
    // Detail rows
    remainingQuota: 'Remaining Quota',
    expiresAt: 'Expires At',
    todayExpires: '(expires today)',
    daysLeft: '({days} days)',
    usedQuota: 'Used Quota',
    resetNow: 'Resetting soon',
    subscriptionType: 'Subscription Type',
    billingType: 'Billing Type',
    subscriptionExpires: 'Subscription Expires',
    // Usage stat cells
    todayRequests: 'Today Requests',
    todayInputTokens: 'Today Input',
    todayOutputTokens: 'Today Output',
    todayTokens: 'Today Tokens',
    todayCacheCreation: 'Today Cache Creation',
    todayCacheRead: 'Today Cache Read',
    todayCost: 'Today Cost',
    rpmTpm: 'RPM / TPM',
    totalRequests: 'Total Requests',
    totalInputTokens: 'Total Input',
    totalOutputTokens: 'Total Output',
    totalTokensLabel: 'Total Tokens',
    totalCacheCreation: 'Total Cache Creation',
    totalCacheRead: 'Total Cache Read',
    totalCost: 'Total Cost',
    avgDuration: 'Avg Duration',
    // Messages
    enterApiKey: 'Please enter an API Key',
    querySuccess: 'Query successful',
    queryFailed: 'Query failed',
    queryFailedRetry: 'Query failed, please try again later',
    noDailyUsage: 'No daily usage data',
  },

  // Setup Wizard
  setup: {
    title: 'Sub2API Setup',
    description: 'Configure your Sub2API instance',
    database: {
      title: 'Database Configuration',
      description: 'Connect to your PostgreSQL database',
      host: 'Host',
      port: 'Port',
      username: 'Username',
      password: 'Password',
      databaseName: 'Database Name',
      sslMode: 'SSL Mode',
      passwordPlaceholder: 'Password',
      ssl: {
        disable: 'Disable',
        require: 'Require',
        verifyCa: 'Verify CA',
        verifyFull: 'Verify Full'
      }
    },
    redis: {
      title: 'Redis Configuration',
      description: 'Connect to your Redis server',
      host: 'Host',
      port: 'Port',
      username: 'Username (optional)',
      password: 'Password (optional)',
      database: 'Database',
      usernamePlaceholder: 'Leave empty for default user',
      passwordPlaceholder: 'Password',
      enableTls: 'Enable TLS',
      enableTlsHint: 'Use TLS when connecting to Redis (public CA certs)'
    },
    admin: {
      title: 'Admin Account',
      description: 'Create your administrator account',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      passwordPlaceholder: 'Min 8 characters',
      confirmPasswordPlaceholder: 'Confirm password',
      passwordMismatch: 'Passwords do not match'
    },
    ready: {
      title: 'Ready to Install',
      description: 'Review your configuration and complete setup',
      database: 'Database',
      redis: 'Redis',
      adminEmail: 'Admin Email'
    },
    status: {
      testing: 'Testing...',
      success: 'Connection Successful',
      testConnection: 'Test Connection',
      installing: 'Installing...',
      completeInstallation: 'Complete Installation',
      completed: 'Installation completed!',
      redirecting: 'Redirecting to login page...',
      restarting: 'Service is restarting, please wait...',
      timeout: 'Service restart is taking longer than expected. Please refresh the page manually.'
    }
  },

  // Common
}
