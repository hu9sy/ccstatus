import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ServicePresenter } from '../../../src/presenters/service-presenter.ts'
import type { StatusSummary, Component } from '../../../src/lib/types.ts'
import { testDates } from '../../helpers/fixtures.ts'
import { consola } from 'consola'

// consolaメソッドをスパイ化
const mockConsolaBox = vi.spyOn(consola, 'box').mockImplementation(() => {})
const mockConsolaLog = vi.spyOn(consola, 'log').mockImplementation(() => {})
const mockConsolaWarn = vi.spyOn(consola, 'warn').mockImplementation(() => {})
const mockConsolaInfo = vi.spyOn(consola, 'info').mockImplementation(() => {})

// グローバルconsoleをモック
const originalConsoleLog = console.log
const mockConsoleLog = vi.fn()

describe('ServicePresenter', () => {
  let presenter: ServicePresenter

  beforeEach(() => {
    presenter = new ServicePresenter()
    console.log = mockConsoleLog
    vi.clearAllMocks()
  })

  afterEach(() => {
    console.log = originalConsoleLog
  })

  describe('displayStatusSummary', () => {
    it('ステータスサマリーをボックス形式で表示する', () => {
      const mockData: StatusSummary = {
        status: {
          indicator: 'none',
          description: 'All Systems Operational'
        },
        page: {
          id: 'page-1',
          name: 'Anthropic Status',
          url: 'https://status.anthropic.com',
          time_zone: 'Etc/UTC',
          updated_at: testDates.utc
        },
        components: [],
        incidents: [],
        scheduled_maintenances: []
      }

      presenter.displayStatusSummary(mockData)

      expect(mockConsolaBox).toHaveBeenCalledTimes(1)
      expect(mockConsolaBox).toHaveBeenCalledWith({
        title: 'Claude Service Status',
        message: expect.stringContaining('Status: All Systems Operational'),
        style: {
          borderColor: 'blue',
          borderStyle: 'round'
        }
      })

      const callArgs = mockConsolaBox.mock.calls[0][0]
      expect(callArgs.message).toContain('Updated:')
      expect(callArgs.message).toContain('UTC')
    })

    it('ステータスと更新日時が正しく表示される', () => {
      const mockData: StatusSummary = {
        status: {
          indicator: 'minor',
          description: 'Minor Service Issues'
        },
        page: {
          id: 'page-1',
          name: 'Anthropic Status',
          url: 'https://status.anthropic.com',
          time_zone: 'Etc/UTC',
          updated_at: '2025-07-21T15:30:00.000Z'
        },
        components: [],
        incidents: [],
        scheduled_maintenances: []
      }

      presenter.displayStatusSummary(mockData)

      const callArgs = mockConsolaBox.mock.calls[0][0]
      expect(callArgs.message).toContain('Status: Minor Service Issues')
      expect(callArgs.message).toContain('Updated:')
      expect(callArgs.message).toContain('2025')
    })
  })

  describe('displayComponents', () => {
    it('コンポーネント一覧をテーブル形式で表示する', () => {
      const mockComponents: Component[] = [
        {
          id: 'comp-1',
          name: 'Claude API',
          status: 'operational',
          created_at: testDates.utc,
          updated_at: testDates.utc,
          position: 1,
          description: 'Claude API service',
          showcase: true,
          start_date: null,
          group_id: null,
          page_id: 'page-1',
          group: false,
          only_show_if_degraded: false
        },
        {
          id: 'comp-2',
          name: 'Claude Web',
          status: 'degraded_performance',
          created_at: testDates.utc,
          updated_at: testDates.utc,
          position: 2,
          description: null,
          showcase: true,
          start_date: null,
          group_id: null,
          page_id: 'page-1',
          group: false,
          only_show_if_degraded: false
        }
      ]

      presenter.displayComponents(mockComponents)

      expect(mockConsolaLog).toHaveBeenCalledWith('\nサービスコンポーネント:')
      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      
      // テーブルの内容が文字列として出力される
      const tableOutput = mockConsoleLog.mock.calls[0][0]
      expect(tableOutput).toContain('Claude API')
      expect(tableOutput).toContain('Claude Web')
    })

    it('空のコンポーネント配列の場合は何も表示しない', () => {
      presenter.displayComponents([])

      expect(mockConsolaLog).not.toHaveBeenCalled()
      expect(mockConsoleLog).not.toHaveBeenCalled()
    })

    it('説明がnullの場合は空文字で表示する', () => {
      const mockComponents: Component[] = [
        {
          id: 'comp-1',
          name: 'Test Component',
          status: 'operational',
          created_at: testDates.utc,
          updated_at: testDates.utc,
          position: 1,
          description: null,
          showcase: true,
          start_date: null,
          group_id: null,
          page_id: 'page-1',
          group: false,
          only_show_if_degraded: false
        }
      ]

      presenter.displayComponents(mockComponents)

      expect(mockConsolaLog).toHaveBeenCalledWith('\nサービスコンポーネント:')
      expect(mockConsoleLog).toHaveBeenCalledTimes(1)
      
      const tableOutput = mockConsoleLog.mock.calls[0][0]
      expect(tableOutput).toContain('Test Component')
    })

    it('複数のステータスタイプを正しく処理する', () => {
      const mockComponents: Component[] = [
        {
          id: 'comp-1',
          name: 'Component 1',
          status: 'operational',
          created_at: testDates.utc,
          updated_at: testDates.utc,
          position: 1,
          description: 'Working fine',
          showcase: true,
          start_date: null,
          group_id: null,
          page_id: 'page-1',
          group: false,
          only_show_if_degraded: false
        },
        {
          id: 'comp-2',
          name: 'Component 2',
          status: 'major_outage',
          created_at: testDates.utc,
          updated_at: testDates.utc,
          position: 2,
          description: 'Major issues',
          showcase: true,
          start_date: null,
          group_id: null,
          page_id: 'page-1',
          group: false,
          only_show_if_degraded: false
        }
      ]

      presenter.displayComponents(mockComponents)

      const tableOutput = mockConsoleLog.mock.calls[0][0]
      expect(tableOutput).toContain('Component 1')
      expect(tableOutput).toContain('Component 2')
      expect(tableOutput).toContain('Working fine')
      expect(tableOutput).toContain('Major issues')
    })
  })

  describe('displayAdditionalInfo', () => {
    it('アクティブなインシデントがある場合に警告表示する', () => {
      const mockData: StatusSummary = {
        status: {
          indicator: 'major',
          description: 'Major Service Issues'
        },
        page: {
          id: 'page-1',
          name: 'Anthropic Status',
          url: 'https://status.anthropic.com',
          time_zone: 'Etc/UTC',
          updated_at: testDates.utc
        },
        components: [],
        incidents: [
          {
            id: 'incident-1',
            name: 'API Issues',
            status: 'investigating',
            created_at: testDates.utc,
            updated_at: testDates.utc,
            monitoring_at: null,
            resolved_at: null,
            impact: 'major',
            shortlink: 'https://stspg.io/abc123',
            started_at: testDates.utc,
            page_id: 'page-1',
            incident_updates: [],
            components: []
          }
        ],
        scheduled_maintenances: []
      }

      presenter.displayAdditionalInfo(mockData)

      expect(mockConsolaWarn).toHaveBeenCalledWith('\nアクティブなインシデント:')
      expect(mockConsolaLog).toHaveBeenCalledWith('  • API Issues: investigating')
    })

    it('予定されたメンテナンスがある場合に情報表示する', () => {
      const mockData: StatusSummary = {
        status: {
          indicator: 'none',
          description: 'All Systems Operational'
        },
        page: {
          id: 'page-1',
          name: 'Anthropic Status',
          url: 'https://status.anthropic.com',
          time_zone: 'Etc/UTC',
          updated_at: testDates.utc
        },
        components: [],
        incidents: [],
        scheduled_maintenances: [
          {
            id: 'maint-1',
            name: 'Scheduled Maintenance',
            status: 'scheduled',
            created_at: testDates.utc,
            updated_at: testDates.utc,
            monitoring_at: null,
            resolved_at: null,
            impact: 'minor',
            shortlink: 'https://stspg.io/xyz789',
            started_at: testDates.utc,
            page_id: 'page-1',
            scheduled_for: testDates.utc,
            scheduled_until: testDates.utc,
            incident_updates: [],
            components: []
          }
        ]
      }

      presenter.displayAdditionalInfo(mockData)

      expect(mockConsolaInfo).toHaveBeenCalledWith('\n予定されたメンテナンス:')
      expect(mockConsolaLog).toHaveBeenCalledWith('  • Scheduled Maintenance: scheduled')
    })

    it('インシデントとメンテナンスがない場合は何も表示しない', () => {
      const mockData: StatusSummary = {
        status: {
          indicator: 'none',
          description: 'All Systems Operational'
        },
        page: {
          id: 'page-1',
          name: 'Anthropic Status',
          url: 'https://status.anthropic.com',
          time_zone: 'Etc/UTC',
          updated_at: testDates.utc
        },
        components: [],
        incidents: [],
        scheduled_maintenances: []
      }

      presenter.displayAdditionalInfo(mockData)

      expect(mockConsolaWarn).not.toHaveBeenCalled()
      expect(mockConsolaInfo).not.toHaveBeenCalled()
      expect(mockConsolaLog).not.toHaveBeenCalled()
    })

    it('複数のインシデントとメンテナンスを同時に表示する', () => {
      const mockData: StatusSummary = {
        status: {
          indicator: 'major',
          description: 'Multiple Issues'
        },
        page: {
          id: 'page-1',
          name: 'Anthropic Status',
          url: 'https://status.anthropic.com',
          time_zone: 'Etc/UTC',
          updated_at: testDates.utc
        },
        components: [],
        incidents: [
          {
            id: 'incident-1',
            name: 'First Issue',
            status: 'investigating',
            created_at: testDates.utc,
            updated_at: testDates.utc,
            monitoring_at: null,
            resolved_at: null,
            impact: 'major',
            shortlink: 'https://stspg.io/abc123',
            started_at: testDates.utc,
            page_id: 'page-1',
            incident_updates: [],
            components: []
          },
          {
            id: 'incident-2',
            name: 'Second Issue',
            status: 'identified',
            created_at: testDates.utc,
            updated_at: testDates.utc,
            monitoring_at: null,
            resolved_at: null,
            impact: 'minor',
            shortlink: 'https://stspg.io/def456',
            started_at: testDates.utc,
            page_id: 'page-1',
            incident_updates: [],
            components: []
          }
        ],
        scheduled_maintenances: [
          {
            id: 'maint-1',
            name: 'Weekly Maintenance',
            status: 'scheduled',
            created_at: testDates.utc,
            updated_at: testDates.utc,
            monitoring_at: null,
            resolved_at: null,
            impact: 'minor',
            shortlink: 'https://stspg.io/xyz789',
            started_at: testDates.utc,
            page_id: 'page-1',
            scheduled_for: testDates.utc,
            scheduled_until: testDates.utc,
            incident_updates: [],
            components: []
          }
        ]
      }

      presenter.displayAdditionalInfo(mockData)

      expect(mockConsolaWarn).toHaveBeenCalledWith('\nアクティブなインシデント:')
      expect(mockConsolaInfo).toHaveBeenCalledWith('\n予定されたメンテナンス:')
      expect(mockConsolaLog).toHaveBeenCalledWith('  • First Issue: investigating')
      expect(mockConsolaLog).toHaveBeenCalledWith('  • Second Issue: identified')
      expect(mockConsolaLog).toHaveBeenCalledWith('  • Weekly Maintenance: scheduled')
    })
  })
})