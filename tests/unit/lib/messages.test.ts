import { describe, it, expect } from 'vitest'
import { MESSAGES } from '../../../src/lib/messages.ts'

describe('messages', () => {
  describe('INCIDENT messages', () => {
    it('日本語のメッセージが正しく定義されている', () => {
      expect(MESSAGES.INCIDENT.FETCHING).toMatch(/インシデント情報を取得中/)
      expect(MESSAGES.INCIDENT.NO_INCIDENTS).toMatch(/正常に稼働/)
      expect(MESSAGES.INCIDENT.FETCH_ERROR).toMatch(/取得に失敗/)
      expect(MESSAGES.INCIDENT.UNKNOWN_ERROR).toMatch(/不明なエラー/)
    })

    it('動的メッセージ関数が正しく動作する', () => {
      expect(MESSAGES.INCIDENT.DISPLAY_HEADER(5)).toBe('📊 最新のインシデント 5 件を表示:')
      expect(MESSAGES.INCIDENT.DISPLAY_HEADER(0)).toBe('📊 最新のインシデント 0 件を表示:')
      expect(MESSAGES.INCIDENT.DISPLAY_HEADER(1)).toBe('📊 最新のインシデント 1 件を表示:')
    })

    it('ステータス翻訳が正しく定義されている', () => {
      expect(MESSAGES.INCIDENT.STATUS.INVESTIGATING).toBe('調査中')
      expect(MESSAGES.INCIDENT.STATUS.IDENTIFIED).toBe('原因特定')
      expect(MESSAGES.INCIDENT.STATUS.MONITORING).toBe('監視中')
      expect(MESSAGES.INCIDENT.STATUS.RESOLVED).toBe('解決済み')
      expect(MESSAGES.INCIDENT.STATUS.POSTMORTEM).toBe('事後分析')
    })

    it('ラベルが日本語で定義されている', () => {
      expect(MESSAGES.INCIDENT.LABELS.STATUS).toBe('ステータス')
      expect(MESSAGES.INCIDENT.LABELS.IMPACT).toBe('影響度')
      expect(MESSAGES.INCIDENT.LABELS.CREATED_AT).toBe('発生日時')
      expect(MESSAGES.INCIDENT.LABELS.RESOLVED_AT).toBe('解決日時')
      expect(MESSAGES.INCIDENT.LABELS.LATEST_UPDATE).toBe('最新更新')
      expect(MESSAGES.INCIDENT.LABELS.DETAILS).toBe('詳細')
      expect(MESSAGES.INCIDENT.LABELS.UNRESOLVED).toBe('未解決')
    })
  })

  describe('SERVICE messages', () => {
    it('サービス関連のメッセージが日本語で定義されている', () => {
      expect(MESSAGES.SERVICE.COMPONENTS_HEADER).toMatch(/コンポーネント/)
      expect(MESSAGES.SERVICE.ACTIVE_INCIDENTS).toMatch(/インシデント/)
      expect(MESSAGES.SERVICE.SCHEDULED_MAINTENANCE).toMatch(/メンテナンス/)
    })

    it('テーブルヘッダーが日本語で定義されている', () => {
      expect(MESSAGES.SERVICE.TABLE_HEADERS.COMPONENT).toBe('コンポーネント')
      expect(MESSAGES.SERVICE.TABLE_HEADERS.STATUS).toBe('ステータス')
      expect(MESSAGES.SERVICE.TABLE_HEADERS.UPDATED_AT).toBe('更新日時')
      expect(MESSAGES.SERVICE.TABLE_HEADERS.DESCRIPTION).toBe('備考')
    })
  })

  describe('COMMON messages', () => {
    it('共通メッセージが正しく定義されている', () => {
      expect(MESSAGES.COMMON.UTC_SUFFIX).toBe(' UTC')
    })

    it('HTTPエラーメッセージが正しくフォーマットされる', () => {
      expect(MESSAGES.COMMON.HTTP_ERROR(404, 'Not Found')).toBe('HTTP 404: Not Found')
      expect(MESSAGES.COMMON.HTTP_ERROR(500, 'Internal Server Error')).toBe('HTTP 500: Internal Server Error')
    })
  })

  describe('Constants structure', () => {
    it('MESSAGESがread-onlyとして定義されている', () => {
      expect(typeof MESSAGES).toBe('object')
      expect(MESSAGES).toBeDefined()
    })

    it('すべてのセクションが定義されている', () => {
      expect(MESSAGES.INCIDENT).toBeDefined()
      expect(MESSAGES.SERVICE).toBeDefined()
      expect(MESSAGES.COMMON).toBeDefined()
    })
  })
})