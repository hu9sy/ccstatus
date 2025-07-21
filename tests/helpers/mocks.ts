import { vi } from 'vitest'
import type { Component, Incident, StatusSummary, ComponentStatus, IncidentStatus, ImpactLevel } from '../../src/lib/types.ts'

// Anthropic Status API モックレスポンス
export const mockServiceStatus = {
  page: {
    id: 'test-page-id',
    name: 'Claude Code Status',
    url: 'https://status.anthropic.com',
    time_zone: 'UTC',
    updated_at: '2025-07-21T12:00:00.000Z'
  },
  components: [
    {
      id: 'component-1',
      name: 'Claude Code',
      status: 'operational',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-07-21T12:00:00.000Z',
      position: 1,
      description: 'Claude Code service',
      showcase: true,
      start_date: null,
      group_id: null,
      page_id: 'test-page-id',
      group: false,
      only_show_if_degraded: false
    }
  ],
  incidents: [],
  scheduled_maintenances: [],
  status: {
    indicator: 'none',
    description: 'All Systems Operational'
  }
}

export const mockIncidents = [
  {
    id: 'incident-1',
    name: 'サービス一時停止',
    status: 'resolved',
    created_at: '2025-07-20T10:00:00.000Z',
    updated_at: '2025-07-20T12:00:00.000Z',
    monitoring_at: null,
    resolved_at: '2025-07-20T12:00:00.000Z',
    impact: 'major',
    shortlink: 'http://stspg.io/incident1',
    started_at: '2025-07-20T10:00:00.000Z',
    page_id: 'test-page-id',
    incident_updates: [
      {
        id: 'update-1',
        status: 'resolved',
        body: 'サービスが完全に復旧しました',
        created_at: '2025-07-20T12:00:00.000Z',
        display_at: '2025-07-20T12:00:00.000Z',
        affected_components: []
      }
    ],
    components: []
  }
]

export const mockApiError = {
  error: 'Network Error',
  message: 'Failed to fetch data'
}

// モックファクトリー関数群

/**
 * コンポーネントのモックを生成
 */
export const createMockComponent = (overrides: Partial<Component> = {}): Component => ({
  id: 'component-test',
  name: 'Test Service',
  status: 'operational' as ComponentStatus,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-07-21T12:00:00.000Z',
  position: 1,
  description: 'Test service description',
  showcase: true,
  start_date: null,
  group_id: null,
  page_id: 'test-page-id',
  group: false,
  only_show_if_degraded: false,
  ...overrides
})

/**
 * インシデントのモックを生成
 */
export const createMockIncident = (overrides: Partial<Incident> = {}): Incident => ({
  id: 'incident-test',
  name: 'Test Incident',
  status: 'investigating' as IncidentStatus,
  created_at: '2025-07-21T10:00:00.000Z',
  updated_at: '2025-07-21T11:00:00.000Z',
  monitoring_at: null,
  resolved_at: null,
  impact: 'minor' as ImpactLevel,
  shortlink: 'http://stspg.io/test',
  started_at: '2025-07-21T10:00:00.000Z',
  page_id: 'test-page-id',
  incident_updates: [],
  components: [],
  ...overrides
})

/**
 * ステータスサマリーのモックを生成
 */
export const createMockStatusSummary = (overrides: Partial<StatusSummary> = {}): StatusSummary => ({
  page: {
    id: 'test-page-id',
    name: 'Test Status Page',
    url: 'https://status.test.com',
    time_zone: 'UTC',
    updated_at: '2025-07-21T12:00:00.000Z'
  },
  components: [createMockComponent()],
  incidents: [],
  scheduled_maintenances: [],
  status: {
    indicator: 'none',
    description: 'All Systems Operational'
  },
  ...overrides
})

/**
 * 複数の異なるステータスのコンポーネントを含むモック
 */
export const createMockMultiStatusComponents = (): Component[] => [
  createMockComponent({ 
    id: 'comp-1', 
    name: 'API Service', 
    status: 'operational' 
  }),
  createMockComponent({ 
    id: 'comp-2', 
    name: 'Web Interface', 
    status: 'degraded_performance' 
  }),
  createMockComponent({ 
    id: 'comp-3', 
    name: 'Background Jobs', 
    status: 'partial_outage' 
  }),
  createMockComponent({ 
    id: 'comp-4', 
    name: 'Database', 
    status: 'major_outage' 
  })
]

/**
 * 様々なステータスのインシデントを生成
 */
export const createMockIncidentsByStatus = (): Record<IncidentStatus, Incident> => ({
  investigating: createMockIncident({ 
    id: 'inc-investigating', 
    status: 'investigating',
    name: '調査中のインシデント'
  }),
  identified: createMockIncident({ 
    id: 'inc-identified', 
    status: 'identified',
    name: '原因特定済みのインシデント'
  }),
  monitoring: createMockIncident({ 
    id: 'inc-monitoring', 
    status: 'monitoring',
    name: '監視中のインシデント'
  }),
  resolved: createMockIncident({ 
    id: 'inc-resolved', 
    status: 'resolved',
    name: '解決済みのインシデント',
    resolved_at: '2025-07-21T11:30:00.000Z'
  }),
  postmortem: createMockIncident({ 
    id: 'inc-postmortem', 
    status: 'postmortem',
    name: '事後分析中のインシデント',
    resolved_at: '2025-07-21T11:30:00.000Z'
  })
})

/**
 * エラーレスポンスのモックファクトリー
 */
export const createMockErrorResponse = (status: number, message: string) => ({
  error: {
    type: `Http${status}Error`,
    message,
    code: status
  }
})

/**
 * 遅延を含むPromiseのモック
 */
export const createDelayedMock = <T>(data: T, delay = 100): Promise<T> =>
  new Promise(resolve => globalThis.setTimeout(() => resolve(data), delay))

/**
 * リトライが必要なモック（指定回数失敗後に成功）
 */
export const createRetryableMock = <T>(
  failCount: number, 
  successData: T, 
  errorMessage = 'Temporary failure'
) => {
  let attemptCount = 0
  return vi.fn(() => {
    attemptCount++
    if (attemptCount <= failCount) {
      return Promise.reject(new Error(`${errorMessage} (attempt ${attemptCount})`))
    }
    return Promise.resolve(successData)
  })
}

/**
 * 段階的に異なるレスポンスを返すモック
 */
export const createSequentialMock = <T>(responses: (T | Error)[]) => {
  let callIndex = 0
  return vi.fn(() => {
    const response = responses[callIndex] || responses[responses.length - 1]
    callIndex++
    
    if (response instanceof Error) {
      return Promise.reject(response)
    }
    return Promise.resolve(response)
  })
}

// fetch モック
export const createMockFetch = (response: any, shouldError = false) => {
  return vi.fn(() => {
    if (shouldError) {
      return Promise.reject(new Error(mockApiError.message))
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response)
    } as Response)
  })
}

/**
 * 高度なfetchモック（HTTPステータスコードとヘッダーを含む）
 */
export const createAdvancedMockFetch = (
  response: any, 
  status = 200, 
  headers: Record<string, string> = {}
) => {
  return vi.fn(() => {
    if (response instanceof Error) {
      return Promise.reject(response)
    }

    const ok = status >= 200 && status < 300
    return Promise.resolve({
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      headers: new Headers({ 'content-type': 'application/json', ...headers }),
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response))
    } as Response)
  })
}

/**
 * サービスクラスの包括的なモック
 */
export const createMockStatusService = () => ({
  getServiceStatus: vi.fn().mockResolvedValue(createMockStatusSummary()),
  getComponentsLazy: vi.fn().mockResolvedValue([createMockComponent()]),
  getIncidents: vi.fn().mockResolvedValue({ incidents: [createMockIncident()] }),
  getIncidentsWithLimit: vi.fn().mockResolvedValue({ incidents: [createMockIncident()] }),
  getIncidentsStream: vi.fn().mockReturnValue({
    async *[Symbol.asyncIterator]() {
      yield createMockIncident()
    }
  })
})

/**
 * プレゼンタークラスのモック
 */
export const createMockPresenter = () => ({
  displayStatusSummary: vi.fn(),
  displayComponents: vi.fn(),
  displayIncidents: vi.fn(),
  displayAdditionalInfo: vi.fn(),
  formatDate: vi.fn().mockReturnValue('2025-07-21 21:00:00'),
  formatStatus: vi.fn().mockReturnValue('正常')
})

/**
 * キャッシュサービスのモック
 */
export const createMockCache = () => ({
  get: vi.fn(),
  set: vi.fn(),
  clear: vi.fn(),
  has: vi.fn().mockReturnValue(false),
  delete: vi.fn(),
  size: vi.fn().mockReturnValue(0)
})

/**
 * ロガーのモック
 */
export const createMockLogger = () => ({
  info: vi.fn(),
  debug: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
})