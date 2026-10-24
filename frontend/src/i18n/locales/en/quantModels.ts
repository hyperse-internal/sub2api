export default {
  quantModels: {
    title: 'Quant Models',
    description: 'Intraday signals and local execution tools.',
    eyebrow: 'ALPHAIO · QUANT TOOLS',
    intro: 'Bring context to intraday decisions',
    introDescription: 'Explore four intraday trading tools and learn how signals are generated, delivered, and connected to execution.',
    features: 'Key features',
    advantage: 'Benefits',
    scenarios: 'Best suited for',
    details: 'Explore product',
    recommended: 'Top pick',
    external: 'Visit AlphaIO · Opens in a new window',
    imageAlt: '{name} product preview',
    viewImage: 'View full image',
    previewImage: 'View original image of {name}',
    notice: 'Images contain illustrative data. Signals are for reference only and are not investment advice or a promise of returns. Availability and subscription access are subject to the official product page.',
    products: {
      assist: {
        name: '智T引擎',
        category: 'Signal assistance · Manual execution',
        description: 'An intraday confirmation engine identifies dips, rallies, and reversals, delivering minute-level signals through Feishu for your own review and execution.',
        tags: 'Feishu alerts / Minute-level signals / Manual execution',
        feature1: 'Track symbols and TB / TS / RB / RS signals with Feishu notifications and missed-signal delivery.',
        feature2: 'Review single-symbol backtests, chart markers, and trade details, separating holding returns from intraday contributions.',
        feature3: 'Configure profit targets, stop losses, and maximum holding periods with per-symbol exit suggestions.',
        advantage: 'Spend less time watching the screen and bring alerts, signal review, and analysis into one workflow.',
        scenarios: 'Users tracking selected symbols who want intraday Feishu alerts while placing orders themselves.',
        note: 'Monthly subscriptions with 2–12 tracking slots. Alerts may be delayed.'
      },
      qmt: {
        name: '智T·QMT',
        category: 'Local execution · Fill analysis',
        description: 'A client-side Worker makes local decisions using the shared engine, places orders through QMT, and records fills with Feishu execution reports.',
        tags: 'Local Worker / QMT execution / Fill records',
        feature1: 'Connect intraday confirmation, local decisions, and QMT orders through your own brokerage channel.',
        feature2: 'Use actual fills as the ledger and review chart markers alongside daily execution details.',
        feature3: 'Independent QMT slots can be combined with signal subscriptions, with execution reports sent to Feishu.',
        advantage: 'Connect signals to execution and reconcile actual fills while reducing manual transcription.',
        scenarios: 'Users with a compatible QMT environment seeking local intraday execution and fill analysis.',
        note: 'The official page says the Worker package and authentication are pending release; symbols can be registered first. Execution depends on actual availability.'
      },
      super: {
        name: '超级分时',
        category: 'Intraday signals · Multi-symbol charts',
        description: 'Combine VWAP deviation, key price levels, and capital momentum to display dip, rally, and reversal signals without requiring L2 data.',
        tags: 'No L2 dependency / 15-second refresh / Signal history',
        feature1: 'Compare price, average price, and previous close, with signals marked at the minute they occur.',
        feature2: 'Receive pop-up alerts and distinct sounds for buy and sell signals.',
        feature3: 'Monitor symbols in 1–9 chart panels, search symbols, and review daily signal history.',
        advantage: 'See signals in price context, reduce chart switching, and hear when new signals appear.',
        scenarios: 'Self-directed users who need intraday structure and signal references across multiple symbols.',
        note: 'Signals only; no position management or fill recording. Monthly monitoring slots are separate from 龙头分时.'
      },
      leader: {
        name: '龙头分时',
        category: 'Leader identification · Capital filters',
        description: 'Focus on market leaders and consecutive limit-up candidates using leader identification, large-order outflow filters, and peak-pullback confirmation.',
        tags: 'L2 capital gate / Outflow filters / Rejection history',
        feature1: 'Apply L2 large-order outflow rate constraints to candidate buy signals.',
        feature2: 'Record rejected buy signals to distinguish missing signals from filtered ones.',
        feature3: 'Flag incomplete data coverage and support multiple charts, signal alerts, and sounds.',
        advantage: 'Understand both the signal and the filtering reasons, with visibility into data coverage.',
        scenarios: 'Users studying leaders and consecutive limit-up candidates with large-order capital flow context.',
        note: 'Signals only; dependent on L2 data coverage. Monthly monitoring slots are separate from 超级分时.'
      }
    }
  }
}
