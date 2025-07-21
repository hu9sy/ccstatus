// テストフィクスチャデータ

export const testDates = {
  utc: '2025-07-21T12:00:00.000Z',
  jst: '2025-07-21T21:00:00+09:00',
  iso: '2025-07-21T12:00:00Z'
}

export const testStatuses = {
  operational: 'operational',
  degraded_performance: 'degraded_performance',
  partial_outage: 'partial_outage',
  major_outage: 'major_outage'
} as const

export const testIncidentImpacts = {
  minor: 'minor',
  major: 'major',
  critical: 'critical'
} as const

export const testMessages = {
  japanese: {
    operational: '正常',
    error: 'エラーが発生しました',
    noData: 'データがありません'
  }
}