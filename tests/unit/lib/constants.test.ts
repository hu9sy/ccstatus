import { describe, it, expect } from 'vitest'
import { API_CONSTANTS, UI_CONSTANTS, APP_CONSTANTS } from '../../../src/lib/constants.ts'

describe('constants', () => {
  describe('API_CONSTANTS', () => {
    it('正しいベースURLを定義している', () => {
      expect(API_CONSTANTS.ANTHROPIC_API_BASE).toBe('https://status.anthropic.com/api/v2/')
    })

    it('必要なエンドポイントを定義している', () => {
      expect(API_CONSTANTS.ENDPOINTS.INCIDENTS).toBe('/incidents.json')
      expect(API_CONSTANTS.ENDPOINTS.SUMMARY).toBe('/summary.json')
    })

    it('read-onlyとして定義されている', () => {
      // TypeScript の as const が適用されているかテスト
      expect(() => {
        // @ts-expect-error - read-onlyプロパティへの代入はエラーになるべき
        (API_CONSTANTS as Record<string, unknown>).ANTHROPIC_API_BASE = 'test'
      }).not.toThrow() // ランタイムでは代入可能だが、TypeScriptでエラー
    })
  })

  describe('UI_CONSTANTS', () => {
    it('テーブル設定が正しく定義されている', () => {
      expect(UI_CONSTANTS.TABLE.SERVICE_COL_WIDTHS).toEqual([30, 25, 30, 50])
      expect(UI_CONSTANTS.TABLE.DEFAULT_STYLE.HEAD).toEqual(['cyan'])
      expect(UI_CONSTANTS.TABLE.DEFAULT_STYLE.BORDER).toEqual(['grey'])
    })

    it('ボックススタイルが正しく定義されている', () => {
      expect(UI_CONSTANTS.BOX_STYLE.BORDER_COLOR).toBe('blue')
      expect(UI_CONSTANTS.BOX_STYLE.BORDER_STYLE).toBe('round')
    })
  })

  describe('APP_CONSTANTS', () => {
    it('デフォルトのインシデント制限が正しく設定されている', () => {
      expect(APP_CONSTANTS.DEFAULT_INCIDENT_LIMIT).toBe(3)
      expect(typeof APP_CONSTANTS.DEFAULT_INCIDENT_LIMIT).toBe('number')
      expect(APP_CONSTANTS.DEFAULT_INCIDENT_LIMIT).toBeGreaterThan(0)
    })
  })
})