/**
 * テストデータジェネレーター
 * 様々なシナリオに対応したテストデータを動的に生成
 */

import type { 
  Component, 
  Incident, 
  IncidentUpdate, 
  StatusSummary,
  ComponentStatus,
  IncidentStatus,
  ImpactLevel
} from '../../src/lib/types.ts'

// 基本的なランダムデータ生成
export const randomizers = {
  /**
   * ランダムな文字列を生成
   */
  string: (length = 10): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
  },

  /**
   * ランダムなIDを生成
   */
  id: (prefix = 'test'): string => `${prefix}-${randomizers.string(8)}`,

  /**
   * ランダムな日時を生成（ISO8601形式）
   */
  date: (daysAgo = 30): string => {
    const now = new Date()
    const randomDays = Math.floor(Math.random() * daysAgo)
    const randomHours = Math.floor(Math.random() * 24)
    const randomMinutes = Math.floor(Math.random() * 60)
    
    const date = new Date(now)
    date.setDate(now.getDate() - randomDays)
    date.setHours(randomHours, randomMinutes, 0, 0)
    
    return date.toISOString()
  },

  /**
   * 配列からランダムな要素を選択
   */
  choice: <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)],

  /**
   * ランダムなブール値
   */
  boolean: (): boolean => Math.random() > 0.5,

  /**
   * ランダムな整数（範囲指定）
   */
  integer: (min = 0, max = 100): number => Math.floor(Math.random() * (max - min + 1)) + min
}

// ドメイン固有のデータ生成
export const generators = {
  /**
   * ランダムなコンポーネントステータスを生成
   */
  componentStatus: (): ComponentStatus => 
    randomizers.choice(['operational', 'degraded_performance', 'partial_outage', 'major_outage']),

  /**
   * ランダムなインシデントステータスを生成
   */
  incidentStatus: (): IncidentStatus =>
    randomizers.choice(['investigating', 'identified', 'monitoring', 'resolved', 'postmortem']),

  /**
   * ランダムな影響レベルを生成
   */
  impactLevel: (): ImpactLevel =>
    randomizers.choice(['none', 'minor', 'major', 'critical']),

  /**
   * 日本語のサービス名を生成
   */
  serviceName: (): string =>
    randomizers.choice([
      'Claude Code API',
      'Claude Code Web Interface',
      'Background Processing',
      'Database Service',
      'Authentication Service',
      'File Storage',
      'CDN Service',
      'Monitoring System',
      'Cache Service',
      'Message Queue'
    ]),

  /**
   * 日本語のインシデント名を生成
   */
  incidentName: (): string =>
    randomizers.choice([
      'サービス接続問題',
      'データベース接続エラー',
      'API レスポンス遅延',
      'ファイルアップロード障害',
      'ログイン認証問題',
      'システムメンテナンス',
      '一時的なサービス停止',
      'パフォーマンス低下',
      'ネットワーク接続問題',
      'セキュリティアップデート'
    ]),

  /**
   * インシデント更新メッセージを生成
   */
  incidentUpdateMessage: (status: IncidentStatus): string => {
    const messages: Record<IncidentStatus, string[]> = {
      investigating: [
        '問題の調査を開始しました。',
        'システムの状況を確認中です。',
        '障害の原因を調査しています。'
      ],
      identified: [
        '問題の原因を特定しました。',
        'システムの問題を確認しました。',
        '障害の原因が判明しました。'
      ],
      monitoring: [
        '修正を適用しました。状況を監視中です。',
        'システムの回復を確認しています。',
        'サービスの状態を監視中です。'
      ],
      resolved: [
        '問題は完全に解決されました。',
        'すべてのサービスが正常に動作しています。',
        'システムは正常に復旧しました。'
      ],
      postmortem: [
        'インシデントの事後分析を実施中です。',
        '詳細な分析レポートを準備中です。',
        '今後の改善策を検討しています。'
      ]
    }
    return randomizers.choice(messages[status])
  }
}

// 複合データ生成関数
export const generateComponent = (overrides: Partial<Component> = {}): Component => {
  const createdAt = randomizers.date(90)
  const updatedAt = new Date(Date.now() - randomizers.integer(0, 86400000)).toISOString()
  
  return {
    id: randomizers.id('component'),
    name: generators.serviceName(),
    status: generators.componentStatus(),
    created_at: createdAt,
    updated_at: updatedAt,
    position: randomizers.integer(1, 10),
    description: randomizers.boolean() ? `${generators.serviceName()}の説明` : null,
    showcase: randomizers.boolean(),
    start_date: randomizers.boolean() ? randomizers.date(30) : null,
    group_id: randomizers.boolean() ? randomizers.id('group') : null,
    page_id: 'test-page-id',
    group: randomizers.boolean(),
    only_show_if_degraded: randomizers.boolean(),
    ...overrides
  }
}

export const generateIncidentUpdate = (
  incidentId: string,
  status?: IncidentStatus,
  overrides: Partial<IncidentUpdate> = {}
): IncidentUpdate => {
  const updateStatus = status || generators.incidentStatus()
  const createdAt = randomizers.date(7)
  
  return {
    id: randomizers.id('update'),
    status: updateStatus,
    body: generators.incidentUpdateMessage(updateStatus),
    incident_id: incidentId,
    created_at: createdAt,
    updated_at: createdAt,
    display_at: createdAt,
    affected_components: [],
    ...overrides
  }
}

export const generateIncident = (overrides: Partial<Incident> = {}): Incident => {
  const status = generators.incidentStatus()
  const createdAt = randomizers.date(30)
  const updatedAt = new Date(Date.now() - randomizers.integer(0, 86400000)).toISOString()
  const incidentId = randomizers.id('incident')
  
  // ステータスに応じて resolved_at を設定
  const resolvedAt = ['resolved', 'postmortem'].includes(status) ? updatedAt : null
  
  // インシデント更新履歴を生成
  const updateCount = randomizers.integer(1, 5)
  const incidentUpdates: IncidentUpdate[] = []
  
  const statusFlow: IncidentStatus[] = ['investigating', 'identified', 'monitoring', 'resolved']
  const currentIndex = statusFlow.indexOf(status)
  
  // 現在のステータスまでの更新履歴を生成
  for (let i = 0; i <= Math.min(currentIndex, updateCount - 1); i++) {
    incidentUpdates.push(
      generateIncidentUpdate(incidentId, statusFlow[i])
    )
  }
  
  return {
    id: incidentId,
    name: generators.incidentName(),
    status,
    created_at: createdAt,
    updated_at: updatedAt,
    monitoring_at: status === 'monitoring' ? updatedAt : null,
    resolved_at: resolvedAt,
    impact: generators.impactLevel(),
    shortlink: `http://stspg.io/${randomizers.string(6)}`,
    started_at: createdAt,
    page_id: 'test-page-id',
    incident_updates: incidentUpdates,
    components: [],
    ...overrides
  }
}

export const generateStatusSummary = (overrides: Partial<StatusSummary> = {}): StatusSummary => {
  const componentCount = randomizers.integer(1, 8)
  const incidentCount = randomizers.integer(0, 3)
  
  const components = Array.from({ length: componentCount }, () => generateComponent())
  const incidents = Array.from({ length: incidentCount }, () => generateIncident())
  
  // 全体のステータスを計算
  const hasOutage = components.some(c => c.status.includes('outage'))
  const hasDegraded = components.some(c => c.status === 'degraded_performance')
  const hasActiveIncidents = incidents.some(i => i.status !== 'resolved')
  
  let indicator: ImpactLevel = 'none'
  let description = 'All Systems Operational'
  
  if (hasOutage || hasActiveIncidents) {
    indicator = 'major'
    description = 'Some systems are experiencing issues'
  } else if (hasDegraded) {
    indicator = 'minor'
    description = 'Minor issues detected'
  }
  
  return {
    page: {
      id: 'test-page-id',
      name: 'Claude Code Status',
      url: 'https://status.anthropic.com',
      time_zone: 'UTC',
      updated_at: new Date().toISOString()
    },
    components,
    incidents,
    scheduled_maintenances: [],
    status: {
      indicator,
      description
    },
    ...overrides
  }
}

// バッチ生成関数
export const batchGenerate = {
  /**
   * 指定した数のコンポーネントを生成
   */
  components: (count: number, template?: Partial<Component>): Component[] =>
    Array.from({ length: count }, () => generateComponent(template)),

  /**
   * 指定した数のインシデントを生成
   */
  incidents: (count: number, template?: Partial<Incident>): Incident[] =>
    Array.from({ length: count }, () => generateIncident(template)),

  /**
   * 各ステータス1つずつのコンポーネントを生成
   */
  componentsWithAllStatuses: (): Component[] => [
    generateComponent({ status: 'operational', name: 'API Service' }),
    generateComponent({ status: 'degraded_performance', name: 'Web Interface' }),
    generateComponent({ status: 'partial_outage', name: 'Background Jobs' }),
    generateComponent({ status: 'major_outage', name: 'Database' })
  ],

  /**
   * 各ステータス1つずつのインシデントを生成
   */
  incidentsWithAllStatuses: (): Incident[] => [
    generateIncident({ status: 'investigating', name: '調査中のインシデント' }),
    generateIncident({ status: 'identified', name: '原因特定済みインシデント' }),
    generateIncident({ status: 'monitoring', name: '監視中のインシデント' }),
    generateIncident({ status: 'resolved', name: '解決済みインシデント' }),
    generateIncident({ status: 'postmortem', name: '事後分析中のインシデント' })
  ]
}

// シナリオ固有のデータ生成
export const scenarios = {
  /**
   * 正常稼働のシナリオ
   */
  allOperational: (): StatusSummary => 
    generateStatusSummary({
      components: batchGenerate.components(3, { status: 'operational' }),
      incidents: [],
      status: { indicator: 'none', description: 'All Systems Operational' }
    }),

  /**
   * 障害発生中のシナリオ
   */
  majorOutage: (): StatusSummary =>
    generateStatusSummary({
      components: [
        generateComponent({ status: 'major_outage', name: 'Core API' }),
        generateComponent({ status: 'operational', name: 'Monitoring' })
      ],
      incidents: [
        generateIncident({ status: 'investigating', impact: 'major' })
      ],
      status: { indicator: 'major', description: 'Major service disruption' }
    }),

  /**
   * 復旧監視中のシナリオ
   */
  recovering: (): StatusSummary =>
    generateStatusSummary({
      components: batchGenerate.components(2, { status: 'degraded_performance' }),
      incidents: [
        generateIncident({ status: 'monitoring', impact: 'minor' })
      ],
      status: { indicator: 'minor', description: 'Services are recovering' }
    }),

  /**
   * メンテナンス中のシナリオ
   */
  maintenance: (): StatusSummary =>
    generateStatusSummary({
      components: [
        generateComponent({ status: 'operational', name: 'API' }),
        generateComponent({ status: 'partial_outage', name: 'Scheduled Maintenance' })
      ],
      incidents: [
        generateIncident({ 
          status: 'monitoring', 
          name: '定期メンテナンス',
          impact: 'minor'
        })
      ]
    }),

  /**
   * 大量インシデント履歴のシナリオ
   */
  manyIncidents: (): StatusSummary => {
    const recentIncidents = Array.from({ length: 10 }, (_, i) => 
      generateIncident({
        status: i < 2 ? 'investigating' : 'resolved',
        name: `インシデント ${i + 1}`
      })
    )
    
    return generateStatusSummary({
      incidents: recentIncidents
    })
  }
}

// テスト用のエッジケース生成
export const edgeCases = {
  /**
   * 空のレスポンス
   */
  empty: (): StatusSummary => ({
    page: {
      id: 'test-page-id',
      name: 'Empty Status Page',
      url: 'https://status.test.com',
      time_zone: 'UTC',
      updated_at: new Date().toISOString()
    },
    components: [],
    incidents: [],
    scheduled_maintenances: [],
    status: { indicator: 'none', description: 'No data available' }
  }),

  /**
   * nullフィールドを多く含むデータ
   */
  withNulls: (): StatusSummary =>
    generateStatusSummary({
      components: [
        generateComponent({
          description: null,
          start_date: null,
          group_id: null
        })
      ],
      incidents: [
        generateIncident({
          monitoring_at: null,
          resolved_at: null
        })
      ]
    }),

  /**
   * 異常に長い文字列を含むデータ
   */
  withLongStrings: (): StatusSummary => {
    const longString = 'A'.repeat(1000)
    return generateStatusSummary({
      components: [
        generateComponent({
          name: longString,
          description: longString
        })
      ],
      incidents: [
        generateIncident({
          name: longString,
          incident_updates: [
            generateIncidentUpdate('inc-1', 'investigating', {
              body: longString
            })
          ]
        })
      ]
    })
  },

  /**
   * Unicode文字を含むデータ
   */
  withUnicodeChars: (): StatusSummary =>
    generateStatusSummary({
      components: [
        generateComponent({
          name: 'API Service 🚀',
          description: 'APIサービス（絵文字テスト）💻'
        })
      ],
      incidents: [
        generateIncident({
          name: 'メンテナンス完了 ✅',
          incident_updates: [
            generateIncidentUpdate('inc-unicode', 'resolved', {
              body: 'すべて正常に動作しています 🎉'
            })
          ]
        })
      ]
    })
}