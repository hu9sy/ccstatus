import { describe, it, expect } from 'vitest'
import {
  getStatusIcon,
  getImpactIcon,
  getStatusText,
  formatDateTime,
  formatIncidentForDisplay,
  coloredStatus
} from '../../../src/lib/utils.ts'
import { testDates } from '../../helpers/fixtures.ts'
import type { Incident } from '../../../src/lib/types.ts'

describe('utils', () => {
  describe('getStatusIcon', () => {
    it('有効なステータスに対して正しいアイコンを返す', () => {
      expect(getStatusIcon('investigating')).toBe('🔍')
      expect(getStatusIcon('identified')).toBe('🔎')
      expect(getStatusIcon('monitoring')).toBe('👀')
      expect(getStatusIcon('resolved')).toBe('✅')
      expect(getStatusIcon('postmortem')).toBe('📝')
    })

    it('不明なステータスに対してデフォルトアイコンを返す', () => {
      expect(getStatusIcon('unknown')).toBe('❓')
      expect(getStatusIcon('')).toBe('❓')
    })
  })

  describe('getImpactIcon', () => {
    it('有効な影響レベルに対して正しいアイコンを返す', () => {
      expect(getImpactIcon('none')).toBe('🟢')
      expect(getImpactIcon('minor')).toBe('🟡')
      expect(getImpactIcon('major')).toBe('🟠')
      expect(getImpactIcon('critical')).toBe('🔴')
    })

    it('不明な影響レベルに対してデフォルトアイコンを返す', () => {
      expect(getImpactIcon('unknown')).toBe('⚪')
      expect(getImpactIcon('')).toBe('⚪')
    })
  })

  describe('getStatusText', () => {
    it('有効なステータスを日本語に翻訳する', () => {
      expect(getStatusText('investigating')).toBe('調査中')
      expect(getStatusText('identified')).toBe('原因特定')
      expect(getStatusText('monitoring')).toBe('監視中')
      expect(getStatusText('resolved')).toBe('解決済み')
      expect(getStatusText('postmortem')).toBe('事後分析')
    })

    it('不明なステータスはそのまま返す', () => {
      expect(getStatusText('unknown')).toBe('unknown')
      expect(getStatusText('')).toBe('')
    })
  })

  describe('formatDateTime', () => {
    it('UTC時刻をJSTと表示形式でフォーマットする', () => {
      const result = formatDateTime(testDates.utc)
      expect(result).toMatch(/\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2}/)
      expect(result).toContain('UTC')
    })

    it('マルチライン表示オプションが正しく動作する', () => {
      const result = formatDateTime(testDates.utc, true)
      expect(result).toContain('\n')
      expect(result).toContain('UTC')
    })

    it('シングルライン表示（デフォルト）が正しく動作する', () => {
      const result = formatDateTime(testDates.utc, false)
      expect(result).not.toContain('\n')
      expect(result).toContain('(')
      expect(result).toContain(')')
    })
  })

  describe('formatIncidentForDisplay', () => {
    const mockIncident: Incident = {
      id: 'incident-1',
      name: 'テストインシデント',
      status: 'resolved',
      created_at: testDates.utc,
      updated_at: testDates.utc,
      monitoring_at: null,
      resolved_at: testDates.utc,
      impact: 'major',
      shortlink: 'http://example.com/incident1',
      started_at: testDates.utc,
      page_id: 'page-1',
      incident_updates: [
        {
          id: 'update-1',
          status: 'resolved',
          body: '解決しました',
          created_at: testDates.utc,
          display_at: testDates.utc,
          affected_components: []
        }
      ],
      components: []
    }

    it('インシデント情報を正しく表示用にフォーマットする', () => {
      const formatted = formatIncidentForDisplay(mockIncident, 0)
      
      expect(formatted.title).toContain('1. ✅ テストインシデント')
      expect(formatted.status).toContain('解決済み')
      expect(formatted.impact).toContain('major')
      expect(formatted.createdAt).toContain('発生日時:')
      expect(formatted.resolvedAt).toContain('解決日時:')
      expect(formatted.detailsUrl).toContain('詳細:')
    })

    it('インデックスが正しく表示される', () => {
      const formatted = formatIncidentForDisplay(mockIncident, 2)
      expect(formatted.title).toContain('3. ✅')
    })

    it('未解決のインシデントを正しく処理する', () => {
      const unresolvedIncident = { ...mockIncident, resolved_at: null }
      const formatted = formatIncidentForDisplay(unresolvedIncident, 0)
      
      expect(formatted.resolvedAt).toContain('未解決')
    })

    it('更新履歴がある場合に最新更新を表示する', () => {
      const formatted = formatIncidentForDisplay(mockIncident, 0)
      expect(formatted.latestUpdate).toContain('最新更新:')
      expect(formatted.latestUpdate).toContain('解決済み')
    })

    it('更新履歴がない場合にlatestUpdateがundefinedになる', () => {
      const incidentWithoutUpdates = { ...mockIncident, incident_updates: [] }
      const formatted = formatIncidentForDisplay(incidentWithoutUpdates, 0)
      expect(formatted.latestUpdate).toBeUndefined()
    })
  })

  describe('coloredStatus', () => {
    it('オペレーショナルステータスを緑色でフォーマットする', () => {
      const result = coloredStatus('operational')
      expect(result).toContain('operational')
    })

    it('パフォーマンス低下ステータスを黄色でフォーマットする', () => {
      const result = coloredStatus('degraded_performance')
      expect(result).toContain('degraded_performance')
    })

    it('部分的障害ステータスをマゼンタでフォーマットする', () => {
      const result = coloredStatus('partial_outage')
      expect(result).toContain('partial_outage')
    })

    it('大規模障害ステータスを赤色でフォーマットする', () => {
      const result = coloredStatus('major_outage')
      expect(result).toContain('major_outage')
    })

    it('不明なステータスをグレーでフォーマットする', () => {
      const result = coloredStatus('unknown')
      expect(result).toContain('unknown')
    })
  })
})