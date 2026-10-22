export default {
  consumptionReport: {
    title: 'Consumption Report',
    description: 'Spend by user + model + date (max 7 days); costs sum each request’s stored model price',
    query: 'Query',
    querying: 'Querying…',
    userRequired: 'Please select a user first',
    rangeTooLong: 'Date range must be at most 7 days',
    endBeforeStart: 'End date must be on or after start date',
    emptyHint: 'Select a user and date range, then query',
    noData: 'No consumption in this period',
    failedToLoad: 'Failed to load consumption report',
    userFilter: 'User',
    searchUserPlaceholder: 'Search user by email…',
    userDeletedBadge: 'Deleted',
    modelFilter: 'Model',
    modelPlaceholder: 'Optional exact model name',
    startDate: 'Start date',
    endDate: 'End date',
    last7Days: 'Last 7 days',
    timezone: 'Timezone',
    summary: {
      title: 'Summary',
      requests: 'Requests',
      inputTokens: 'Input tokens',
      outputTokens: 'Output tokens',
      cacheReadTokens: 'Cache hit tokens',
      cacheCreationTokens: 'Cache creation tokens',
      totalTokens: 'Total tokens',
      listCost: 'List cost',
      actualCost: 'Billed',
      avgRate: 'Avg rate',
      avgDuration: 'Avg duration'
    },
    daily: {
      title: 'Detail (user × model × date)',
      date: 'Date',
      model: 'Model',
      requests: 'Requests',
      inputTokens: 'Input',
      outputTokens: 'Output',
      cacheReadTokens: 'Cache hit',
      cacheRatio: 'Cache ratio',
      totalTokens: 'Total tokens',
      listCost: 'List cost',
      actualCost: 'Billed'
    },
    models: {
      title: 'Model totals (period)',
      model: 'Model',
      requests: 'Requests',
      totalTokens: 'Total tokens',
      listCost: 'List cost',
      actualCost: 'Billed'
    },
    hints: {
      listCost: 'Pre-multiplier list pricing (usage_logs.total_cost)',
      actualCost: 'Actual charge including group rate (usage_logs.actual_cost)',
      cacheRatio: 'Cache hit tokens ÷ (input + cache hit + cache creation)'
    }
  }
}
