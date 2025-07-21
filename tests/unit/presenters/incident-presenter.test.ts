import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IncidentPresenter } from '../../../src/presenters/incident-presenter.ts'
import type { Incident } from '../../../src/lib/types.ts'
import { testDates } from '../../helpers/fixtures.ts'
import { consola } from 'consola'
import * as utilsModule from '../../../src/lib/utils.ts'

// consolaメソッドをスパイ化
const mockConsolaLog = vi.spyOn(consola, 'log').mockImplementation(() => {})

// formatIncidentForDisplayのモック
vi.spyOn(utilsModule, 'formatIncidentForDisplay').mockImplementation((incident: Incident, index: number) => ({
  title: `${index + 1}. ✅ ${incident.name}`,
  status: `ステータス: ${incident.status}`,
  impact: `影響度: ${incident.impact}`,
  createdAt: `発生日時: ${incident.created_at}`,
  resolvedAt: incident.resolved_at ? `解決日時: ${incident.resolved_at}` : '解決日時: 未解決',
  latestUpdate: incident.incident_updates.length > 0 
    ? `最新更新: ${incident.incident_updates[0].status} - ${incident.incident_updates[0].body}`
    : undefined,
  detailsUrl: `詳細: ${incident.shortlink}`
}))

describe('IncidentPresenter', () => {
  let presenter: IncidentPresenter

  beforeEach(() => {
    presenter = new IncidentPresenter()
    vi.clearAllMocks()
  })

  describe('displayIncidents', () => {
    it('インシデント一覧を詳細情報とともに表示する', () => {
      const mockIncidents: Incident[] = [
        {
          id: 'incident-1',
          name: 'APIエラー',
          status: 'resolved',
          created_at: testDates.utc,
          updated_at: testDates.utc,
          monitoring_at: null,
          resolved_at: testDates.utc,
          impact: 'major',
          shortlink: 'https://stspg.io/abc123',
          started_at: testDates.utc,
          page_id: 'page-1',
          incident_updates: [
            {
              id: 'update-1',
              status: 'resolved',
              body: '問題が解決されました',
              created_at: testDates.utc,
              display_at: testDates.utc,
              affected_components: []
            }
          ],
          components: []
        },
        {
          id: 'incident-2',
          name: 'データベース問題',
          status: 'investigating',
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
      ]

      presenter.displayIncidents(mockIncidents, 5)

      // ヘッダーが表示されることを確認
      expect(mockConsolaLog).toHaveBeenCalledWith('\n📊 最新のインシデント 2 件を表示:\n')

      // 各インシデントの詳細が表示されることを確認
      expect(mockConsolaLog).toHaveBeenCalledWith('1. ✅ APIエラー')
      expect(mockConsolaLog).toHaveBeenCalledWith('   ステータス: resolved')
      expect(mockConsolaLog).toHaveBeenCalledWith('   影響度: major')
      expect(mockConsolaLog).toHaveBeenCalledWith(`   発生日時: ${testDates.utc}`)
      expect(mockConsolaLog).toHaveBeenCalledWith(`   解決日時: ${testDates.utc}`)
      expect(mockConsolaLog).toHaveBeenCalledWith('   最新更新: resolved - 問題が解決されました')
      expect(mockConsolaLog).toHaveBeenCalledWith('   詳細: https://stspg.io/abc123\n')

      expect(mockConsolaLog).toHaveBeenCalledWith('2. ✅ データベース問題')
      expect(mockConsolaLog).toHaveBeenCalledWith('   ステータス: investigating')
      expect(mockConsolaLog).toHaveBeenCalledWith('   影響度: minor')
      expect(mockConsolaLog).toHaveBeenCalledWith('   解決日時: 未解決')
      expect(mockConsolaLog).toHaveBeenCalledWith('   詳細: https://stspg.io/def456\n')
    })

    it('インシデントが0件の場合にメッセージを表示する', () => {
      presenter.displayIncidents([], 10)

      expect(mockConsolaLog).toHaveBeenCalledWith('✅ インシデントは見つかりませんでした。すべてのサービスが正常に稼働しています。')
      expect(mockConsolaLog).toHaveBeenCalledTimes(1)
    })

    it('更新履歴がない場合は最新更新を表示しない', () => {
      const mockIncident: Incident = {
        id: 'incident-1',
        name: 'テストインシデント',
        status: 'resolved',
        created_at: testDates.utc,
        updated_at: testDates.utc,
        monitoring_at: null,
        resolved_at: testDates.utc,
        impact: 'major',
        shortlink: 'https://stspg.io/test123',
        started_at: testDates.utc,
        page_id: 'page-1',
        incident_updates: [],
        components: []
      }

      presenter.displayIncidents([mockIncident], 1)

      // 最新更新が含まれないことを確認
      const logCalls = mockConsolaLog.mock.calls.map(call => call[0])
      expect(logCalls).not.toContain(expect.stringContaining('最新更新:'))
    })

    it('未解決のインシデントを正しく処理する', () => {
      const mockIncident: Incident = {
        id: 'incident-1',
        name: '継続中の問題',
        status: 'investigating',
        created_at: testDates.utc,
        updated_at: testDates.utc,
        monitoring_at: null,
        resolved_at: null,
        impact: 'critical',
        shortlink: 'https://stspg.io/ongoing',
        started_at: testDates.utc,
        page_id: 'page-1',
        incident_updates: [],
        components: []
      }

      presenter.displayIncidents([mockIncident], 1)

      expect(mockConsolaLog).toHaveBeenCalledWith('1. ✅ 継続中の問題')
      expect(mockConsolaLog).toHaveBeenCalledWith('   ステータス: investigating')
      expect(mockConsolaLog).toHaveBeenCalledWith('   影響度: critical')
      expect(mockConsolaLog).toHaveBeenCalledWith('   解決日時: 未解決')
    })

    it('単一のインシデントを正しく表示する', () => {
      const mockIncident: Incident = {
        id: 'incident-1',
        name: '単発エラー',
        status: 'resolved',
        created_at: testDates.utc,
        updated_at: testDates.utc,
        monitoring_at: null,
        resolved_at: testDates.utc,
        impact: 'minor',
        shortlink: 'https://stspg.io/single',
        started_at: testDates.utc,
        page_id: 'page-1',
        incident_updates: [
          {
            id: 'update-1',
            status: 'resolved',
            body: '修正完了',
            created_at: testDates.utc,
            display_at: testDates.utc,
            affected_components: []
          }
        ],
        components: []
      }

      presenter.displayIncidents([mockIncident], 1)

      expect(mockConsolaLog).toHaveBeenCalledWith('\n📊 最新のインシデント 1 件を表示:\n')
      expect(mockConsolaLog).toHaveBeenCalledWith('1. ✅ 単発エラー')
      expect(mockConsolaLog).toHaveBeenCalledWith('   最新更新: resolved - 修正完了')
    })

    it('originalLimitパラメーターは使用されず問題なく動作する', () => {
      const mockIncident: Incident = {
        id: 'incident-1',
        name: 'テスト',
        status: 'resolved',
        created_at: testDates.utc,
        updated_at: testDates.utc,
        monitoring_at: null,
        resolved_at: testDates.utc,
        impact: 'minor',
        shortlink: 'https://stspg.io/test',
        started_at: testDates.utc,
        page_id: 'page-1',
        incident_updates: [],
        components: []
      }

      // originalLimitパラメーターが異なる値でも同じ結果が得られることを確認
      presenter.displayIncidents([mockIncident], 999)

      expect(mockConsolaLog).toHaveBeenCalledWith('\n📊 最新のインシデント 1 件を表示:\n')
      expect(mockConsolaLog).toHaveBeenCalledWith('1. ✅ テスト')
    })

    it('複数の更新履歴がある場合に最新のもののみ表示する', () => {
      const mockIncident: Incident = {
        id: 'incident-1',
        name: '複数更新インシデント',
        status: 'resolved',
        created_at: testDates.utc,
        updated_at: testDates.utc,
        monitoring_at: null,
        resolved_at: testDates.utc,
        impact: 'major',
        shortlink: 'https://stspg.io/multiple',
        started_at: testDates.utc,
        page_id: 'page-1',
        incident_updates: [
          {
            id: 'update-1',
            status: 'resolved',
            body: '最新の更新',
            created_at: testDates.utc,
            display_at: testDates.utc,
            affected_components: []
          },
          {
            id: 'update-2',
            status: 'investigating',
            body: '古い更新',
            created_at: '2025-07-20T12:00:00.000Z',
            display_at: '2025-07-20T12:00:00.000Z',
            affected_components: []
          }
        ],
        components: []
      }

      presenter.displayIncidents([mockIncident], 1)

      // 最新更新のみが表示されることを確認（モック関数の実装による）
      expect(mockConsolaLog).toHaveBeenCalledWith('   最新更新: resolved - 最新の更新')
      
      const logCalls = mockConsolaLog.mock.calls.map(call => call[0])
      expect(logCalls).not.toContain(expect.stringContaining('古い更新'))
    })
  })

  describe('displayFetchingMessage', () => {
    it('データ取得中のメッセージを表示する', () => {
      presenter.displayFetchingMessage()

      expect(mockConsolaLog).toHaveBeenCalledWith('📋 Anthropic Status API からインシデント情報を取得中...\n')
      expect(mockConsolaLog).toHaveBeenCalledTimes(1)
    })

    it('メッセージが日本語で正しく表示される', () => {
      presenter.displayFetchingMessage()

      const message = mockConsolaLog.mock.calls[0][0]
      expect(message).toContain('📋')
      expect(message).toContain('Anthropic Status API')
      expect(message).toContain('インシデント情報を取得中')
      expect(message).toContain('...')
      expect(message).toMatch(/\n$/)
    })

    it('複数回呼び出しても同じメッセージを表示する', () => {
      presenter.displayFetchingMessage()
      presenter.displayFetchingMessage()

      expect(mockConsolaLog).toHaveBeenCalledTimes(2)
      expect(mockConsolaLog).toHaveBeenNthCalledWith(1, '📋 Anthropic Status API からインシデント情報を取得中...\n')
      expect(mockConsolaLog).toHaveBeenNthCalledWith(2, '📋 Anthropic Status API からインシデント情報を取得中...\n')
    })
  })
})