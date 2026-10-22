export default {
  consumptionReport: {
    title: '消费报表',
    description: '按用户 + 模型 + 日期（最多 7 天）查看消费汇总与明细，费用按各模型请求落库价求和',
    query: '查询',
    querying: '查询中…',
    userRequired: '请先选择用户',
    rangeTooLong: '时间范围最多 7 天',
    endBeforeStart: '结束日期不能早于开始日期',
    emptyHint: '选择用户与日期后点击查询',
    noData: '该时间段内无消费记录',
    failedToLoad: '加载消费报表失败',
    userFilter: '用户',
    searchUserPlaceholder: '按邮箱搜索用户…',
    userDeletedBadge: '已删除',
    modelFilter: '模型',
    modelPlaceholder: '可选，精确模型名',
    startDate: '开始日期',
    endDate: '结束日期',
    last7Days: '近 7 天',
    timezone: '时区',
    summary: {
      title: '汇总',
      requests: '请求数',
      inputTokens: '输入 Token',
      outputTokens: '输出 Token',
      cacheReadTokens: '缓存命中 Token',
      cacheCreationTokens: '缓存创建 Token',
      totalTokens: '总 Token',
      listCost: '标准价',
      actualCost: '实扣金额',
      avgRate: '平均倍率',
      avgDuration: '平均耗时'
    },
    daily: {
      title: '明细（用户 × 模型 × 日期）',
      date: '日期',
      model: '模型',
      requests: '请求',
      inputTokens: '输入',
      outputTokens: '输出',
      cacheReadTokens: '缓存命中',
      cacheRatio: '缓存占比',
      totalTokens: '总 Token',
      listCost: '标准价',
      actualCost: '实扣'
    },
    models: {
      title: '模型汇总（整段）',
      model: '模型',
      requests: '请求',
      totalTokens: '总 Token',
      listCost: '标准价',
      actualCost: '实扣'
    },
    hints: {
      listCost: '倍率前的标准计费（usage_logs.total_cost）',
      actualCost: '实际扣费（含分组倍率，usage_logs.actual_cost）',
      cacheRatio: '缓存命中 Token ÷（输入 + 缓存命中 + 缓存创建）'
    }
  }
}
