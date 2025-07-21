import { describe, it, expect } from 'vitest'
import {
  isValidIncidentStatus,
  isValidImpactLevel,
  isValidComponentStatus,
  isValidServiceIndicator,
  validateComponent,
  validateIncident,
  type Component,
  type Incident
} from '../../../src/lib/types.ts'

describe('types', () => {
  describe('Type Guards', () => {
    describe('isValidIncidentStatus', () => {
      it('有効なインシデントステータスを正しく判定する', () => {
        expect(isValidIncidentStatus('investigating')).toBe(true)
        expect(isValidIncidentStatus('identified')).toBe(true)
        expect(isValidIncidentStatus('monitoring')).toBe(true)
        expect(isValidIncidentStatus('resolved')).toBe(true)
        expect(isValidIncidentStatus('postmortem')).toBe(true)
      })

      it('無効なインシデントステータスを拒否する', () => {
        expect(isValidIncidentStatus('invalid')).toBe(false)
        expect(isValidIncidentStatus('')).toBe(false)
        expect(isValidIncidentStatus('RESOLVED')).toBe(false)
      })
    })

    describe('isValidImpactLevel', () => {
      it('有効な影響レベルを正しく判定する', () => {
        expect(isValidImpactLevel('none')).toBe(true)
        expect(isValidImpactLevel('minor')).toBe(true)
        expect(isValidImpactLevel('major')).toBe(true)
        expect(isValidImpactLevel('critical')).toBe(true)
      })

      it('無効な影響レベルを拒否する', () => {
        expect(isValidImpactLevel('severe')).toBe(false)
        expect(isValidImpactLevel('')).toBe(false)
        expect(isValidImpactLevel('MAJOR')).toBe(false)
      })
    })

    describe('isValidComponentStatus', () => {
      it('有効なコンポーネントステータスを正しく判定する', () => {
        expect(isValidComponentStatus('operational')).toBe(true)
        expect(isValidComponentStatus('degraded_performance')).toBe(true)
        expect(isValidComponentStatus('partial_outage')).toBe(true)
        expect(isValidComponentStatus('major_outage')).toBe(true)
      })

      it('無効なコンポーネントステータスを拒否する', () => {
        expect(isValidComponentStatus('down')).toBe(false)
        expect(isValidComponentStatus('')).toBe(false)
        expect(isValidComponentStatus('OPERATIONAL')).toBe(false)
      })
    })

    describe('isValidServiceIndicator', () => {
      it('有効なサービスインジケーターを正しく判定する', () => {
        expect(isValidServiceIndicator('none')).toBe(true)
        expect(isValidServiceIndicator('minor')).toBe(true)
        expect(isValidServiceIndicator('major')).toBe(true)
        expect(isValidServiceIndicator('critical')).toBe(true)
      })
    })
  })

  describe('Validation Functions', () => {
    describe('validateComponent', () => {
      const validComponent: Component = {
        id: 'component-1',
        name: 'Claude Code',
        status: 'operational',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-07-21T12:00:00Z',
        position: 1,
        description: 'Claude Code service',
        showcase: true,
        start_date: null,
        group_id: null,
        page_id: 'page-1',
        group: false,
        only_show_if_degraded: false
      }

      it('有効なコンポーネントオブジェクトを承認する', () => {
        expect(validateComponent(validComponent)).toBe(true)
      })

      it('必須フィールドが欠けているオブジェクトを拒否する', () => {
        const invalidComponent = { ...validComponent }
        delete (invalidComponent as Record<string, unknown>).id
        expect(validateComponent(invalidComponent)).toBe(false)
      })

      it('無効なステータスを持つオブジェクトを拒否する', () => {
        const invalidComponent = { ...validComponent, status: 'invalid' }
        expect(validateComponent(invalidComponent)).toBe(false)
      })

      it('nullや文字列以外の型を拒否する', () => {
        expect(validateComponent(null)).toBe(false)
        expect(validateComponent('')).toBe(false)
        expect(validateComponent(123)).toBe(false)
        expect(validateComponent([])).toBe(false)
      })
    })

    describe('validateIncident', () => {
      const validIncident: Incident = {
        id: 'incident-1',
        name: 'サービス障害',
        status: 'resolved',
        created_at: '2025-07-20T10:00:00Z',
        updated_at: '2025-07-20T12:00:00Z',
        monitoring_at: null,
        resolved_at: '2025-07-20T12:00:00Z',
        impact: 'major',
        shortlink: 'http://example.com/incident1',
        started_at: '2025-07-20T10:00:00Z',
        page_id: 'page-1',
        incident_updates: [],
        components: []
      }

      it('有効なインシデントオブジェクトを承認する', () => {
        expect(validateIncident(validIncident)).toBe(true)
      })

      it('必須フィールドが欠けているオブジェクトを拒否する', () => {
        const invalidIncident = { ...validIncident }
        delete (invalidIncident as Record<string, unknown>).name
        expect(validateIncident(invalidIncident)).toBe(false)
      })

      it('無効なステータスを持つオブジェクトを拒否する', () => {
        const invalidIncident = { ...validIncident, status: 'invalid' }
        expect(validateIncident(invalidIncident)).toBe(false)
      })

      it('無効な影響レベルを持つオブジェクトを拒否する', () => {
        const invalidIncident = { ...validIncident, impact: 'severe' }
        expect(validateIncident(invalidIncident)).toBe(false)
      })

      it('配列ではないincident_updatesを拒否する', () => {
        const invalidIncident = { ...validIncident, incident_updates: 'not-an-array' }
        expect(validateIncident(invalidIncident)).toBe(false)
      })
    })
  })
})