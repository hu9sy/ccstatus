import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { StatusService, type IStatusService } from '../../../src/services/status-service.ts'
import { Cache } from '../../../src/lib/cache.ts'
import { mockServiceStatus, mockIncidents, createMockFetch } from '../../helpers/mocks.ts'
import { API_CONSTANTS } from '../../../src/lib/constants.ts'
import type { IncidentsResponse, StatusSummary } from '../../../src/lib/types.ts'

// 必要なモジュールをモック
vi.mock('../../../src/lib/config.ts', () => ({
  getApiConfig: () => ({
    baseUrl: 'https://status.anthropic.com/api/v2',
    timeout: 5000,
    maxRetries: 3,
    retryDelayMs: 1000
  }),
  getCacheConfig: () => ({
    ttlSeconds: 300,
    maxSize: 10
  })
}))

vi.mock('../../../src/lib/logger.ts', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    error: vi.fn()
  }
}))

describe('StatusService', () => {
  let service: IStatusService
  let mockCache: Cache
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    mockCache = new Cache()
    service = new StatusService(mockCache)
    originalFetch = globalThis.fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.clearAllMocks()
  })

  describe('getIncidents', () => {
    const mockIncidentsResponse: IncidentsResponse = {
      page: mockServiceStatus.page,
      incidents: mockIncidents
    }

    it('API からインシデントを正常に取得する', async () => {
      globalThis.fetch = createMockFetch(mockIncidentsResponse)

      const incidents = await service.getIncidents()

      expect(incidents).toEqual(mockIncidents)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        `https://status.anthropic.com/api/v2${API_CONSTANTS.ENDPOINTS.INCIDENTS}`,
        expect.any(Object)
      )
    })

    it('キャッシュからインシデントを取得する', async () => {
      // キャッシュに事前設定
      mockCache.set('incidents', mockIncidents)
      globalThis.fetch = vi.fn()

      const incidents = await service.getIncidents()

      expect(incidents).toEqual(mockIncidents)
      expect(globalThis.fetch).not.toHaveBeenCalled()
    })

    it('API エラー時に適切な例外を投げる', async () => {
      globalThis.fetch = createMockFetch(null, true)

      await expect(service.getIncidents()).rejects.toThrow()
    })

    it('HTTP 404 エラーを正しく処理する', async () => {
      globalThis.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          text: () => Promise.resolve('Page not found')
        } as Response)
      )

      await expect(service.getIncidents()).rejects.toThrow('HTTP 404: Not Found')
    })

    it('レート制限時にリトライする', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          text: () => Promise.resolve('')
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockIncidentsResponse)
        } as Response)

      globalThis.fetch = mockFetch

      const incidents = await service.getIncidents()

      expect(incidents).toEqual(mockIncidents)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('getServiceStatus', () => {
    const mockStatusSummary: StatusSummary = {
      ...mockServiceStatus,
      incidents: [],
      scheduled_maintenances: [],
      status: {
        indicator: 'none',
        description: 'All systems operational'
      }
    }

    it('API からサービスステータスを正常に取得する', async () => {
      globalThis.fetch = createMockFetch(mockStatusSummary)

      const status = await service.getServiceStatus()

      expect(status).toEqual(mockStatusSummary)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        `https://status.anthropic.com/api/v2${API_CONSTANTS.ENDPOINTS.SUMMARY}`,
        expect.any(Object)
      )
    })

    it('キャッシュからサービスステータスを取得する', async () => {
      mockCache.set('service_status', mockStatusSummary)
      globalThis.fetch = vi.fn()

      const status = await service.getServiceStatus()

      expect(status).toEqual(mockStatusSummary)
      expect(globalThis.fetch).not.toHaveBeenCalled()
    })

    it('カスタムTTL（1分）でキャッシュに保存する', async () => {
      const setCacheSpy = vi.spyOn(mockCache, 'set')
      globalThis.fetch = createMockFetch(mockStatusSummary)

      await service.getServiceStatus()

      expect(setCacheSpy).toHaveBeenCalledWith('service_status', mockStatusSummary, 60000)
    })
  })

  describe('getIncidentsWithLimit', () => {
    it('指定された件数でインシデントを制限する', () => {
      const result = service.getIncidentsWithLimit(mockIncidents, 1)
      expect(result).toHaveLength(1)
      expect(result[0]).toEqual(mockIncidents[0])
    })

    it('0件制限で空配列を返す', () => {
      const result = service.getIncidentsWithLimit(mockIncidents, 0)
      expect(result).toHaveLength(0)
    })

    it('元の配列より大きな制限値で全件を返す', () => {
      const result = service.getIncidentsWithLimit(mockIncidents, 100)
      expect(result).toEqual(mockIncidents)
    })
  })

  describe('getIncidentsStream', () => {
    const mockIncidentsResponse: IncidentsResponse = {
      page: mockServiceStatus.page,
      incidents: mockIncidents
    }

    it('インシデントをストリームとして取得する', async () => {
      globalThis.fetch = createMockFetch(mockIncidentsResponse)

      const incidents = []
      for await (const incident of service.getIncidentsStream()) {
        incidents.push(incident)
      }

      expect(incidents).toEqual(mockIncidents)
    })

    it('制限付きストリームが正しく動作する', async () => {
      globalThis.fetch = createMockFetch(mockIncidentsResponse)

      const incidents = []
      for await (const incident of service.getIncidentsStream(1)) {
        incidents.push(incident)
      }

      expect(incidents).toHaveLength(1)
      expect(incidents[0]).toEqual(mockIncidents[0])
    })

    it('キャッシュからストリームを取得する', async () => {
      mockCache.set('incidents', mockIncidents)
      globalThis.fetch = vi.fn()

      const incidents = []
      for await (const incident of service.getIncidentsStream()) {
        incidents.push(incident)
      }

      expect(incidents).toEqual(mockIncidents)
      expect(globalThis.fetch).not.toHaveBeenCalled()
    })

    it('API エラー時にストリームが例外を投げる', async () => {
      globalThis.fetch = createMockFetch(null, true)

      const generator = service.getIncidentsStream()
      await expect(generator.next()).rejects.toThrow()
    })
  })

  describe('getComponentsLazy', () => {
    const mockStatusSummary: StatusSummary = {
      ...mockServiceStatus,
      incidents: [],
      scheduled_maintenances: [],
      status: {
        indicator: 'none',
        description: 'All systems operational'
      }
    }

    it('コンポーネントを遅延読み込みで取得する', async () => {
      globalThis.fetch = createMockFetch(mockStatusSummary)

      const components = []
      for await (const component of service.getComponentsLazy()) {
        components.push(component)
      }

      expect(components).toEqual(mockStatusSummary.components)
    })

    it('空のコンポーネントリストを正しく処理する', async () => {
      const emptyStatus = { ...mockStatusSummary, components: [] }
      globalThis.fetch = createMockFetch(emptyStatus)

      const components = []
      for await (const component of service.getComponentsLazy()) {
        components.push(component)
      }

      expect(components).toHaveLength(0)
    })
  })

  describe('キャッシュなしサービス', () => {
    beforeEach(() => {
      service = new StatusService() // キャッシュなし
    })

    it('キャッシュなしでも正常に動作する', async () => {
      const mockIncidentsResponse: IncidentsResponse = {
        page: mockServiceStatus.page,
        incidents: mockIncidents
      }
      globalThis.fetch = createMockFetch(mockIncidentsResponse)

      const incidents = await service.getIncidents()
      expect(incidents).toEqual(mockIncidents)
    })
  })

  describe('エラーハンドリング', () => {
    it('ネットワークエラーを正しく処理する', async () => {
      globalThis.fetch = vi.fn(() => Promise.reject(new TypeError('Network error')))

      await expect(service.getIncidents()).rejects.toThrow('ネットワークエラー:')
    })

    it('タイムアウトエラーを正しく処理する', async () => {
      globalThis.fetch = vi.fn(() => Promise.reject(new Error('Timeout')))

      await expect(service.getIncidents()).rejects.toThrow('Timeout')
    })
  })
})