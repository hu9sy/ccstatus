import { vi, expect } from 'vitest'
import type { Component, Incident, StatusSummary, IncidentsResponse } from '../../src/lib/types.ts'
import { testDates } from './fixtures.ts'

// 時間関連のテストヘルパー
export const timeHelpers = {
  /**
   * 現在時刻をモック
   */
  mockCurrentTime(time: string = testDates.utc) {
    const mockDate = new Date(time)
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
    return mockDate
  },

  /**
   * 時刻のモックを解除
   */
  restoreTime() {
    vi.useRealTimers()
  },

  /**
   * 日付文字列のフォーマットをテスト
   */
  expectDateFormat(dateString: string, expectedFormat: RegExp) {
    expect(dateString).toMatch(expectedFormat)
  }
}

// API関連のテストヘルパー
export const apiHelpers = {
  /**
   * HTTPレスポンスのモック作成
   */
  createMockResponse(data: any, status = 200, ok = true): Response {
    return {
      ok,
      status,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Headers({ 'content-type': 'application/json' })
    } as Response
  },

  /**
   * エラーレスポンスのモック作成
   */
  createErrorResponse(status: number, message: string): Response {
    const errorData = {
      error: {
        type: 'HttpError',
        message,
        code: status
      }
    }
    return this.createMockResponse(errorData, status, false)
  },

  /**
   * ネットワークエラーのモック作成
   */
  createNetworkError(message = 'Network Error'): Promise<Response> {
    return Promise.reject(new Error(message))
  },

  /**
   * fetchモックの設定
   */
  mockFetch(response: any) {
    const mockFetch = vi.fn()
    if (response instanceof Error) {
      mockFetch.mockRejectedValue(response)
    } else {
      mockFetch.mockResolvedValue(
        typeof response === 'object' && 'ok' in response 
          ? response 
          : this.createMockResponse(response)
      )
    }
    vi.stubGlobal('fetch', mockFetch)
    return mockFetch
  }
}

// アサーションヘルパー
export const assertionHelpers = {
  /**
   * Component型の検証
   */
  expectValidComponent(component: any): asserts component is Component {
    expect(component).toHaveProperty('id')
    expect(component).toHaveProperty('name')
    expect(component).toHaveProperty('status')
    expect(component).toHaveProperty('created_at')
    expect(component).toHaveProperty('updated_at')
    expect(typeof component.id).toBe('string')
    expect(typeof component.name).toBe('string')
    expect(['operational', 'degraded_performance', 'partial_outage', 'major_outage']).toContain(component.status)
  },

  /**
   * Incident型の検証
   */
  expectValidIncident(incident: any): asserts incident is Incident {
    expect(incident).toHaveProperty('id')
    expect(incident).toHaveProperty('name')
    expect(incident).toHaveProperty('status')
    expect(incident).toHaveProperty('impact')
    expect(incident).toHaveProperty('incident_updates')
    expect(typeof incident.id).toBe('string')
    expect(typeof incident.name).toBe('string')
    expect(['investigating', 'identified', 'monitoring', 'resolved', 'postmortem']).toContain(incident.status)
    expect(['none', 'minor', 'major', 'critical']).toContain(incident.impact)
    expect(Array.isArray(incident.incident_updates)).toBe(true)
  },

  /**
   * StatusSummary型の検証
   */
  expectValidStatusSummary(summary: any): asserts summary is StatusSummary {
    expect(summary).toHaveProperty('page')
    expect(summary).toHaveProperty('components')
    expect(summary).toHaveProperty('incidents')
    expect(summary).toHaveProperty('status')
    expect(Array.isArray(summary.components)).toBe(true)
    expect(Array.isArray(summary.incidents)).toBe(true)
    expect(summary.status).toHaveProperty('indicator')
    expect(summary.status).toHaveProperty('description')
  },

  /**
   * IncidentsResponse型の検証
   */
  expectValidIncidentsResponse(response: any): asserts response is IncidentsResponse {
    expect(response).toHaveProperty('page')
    expect(response).toHaveProperty('incidents')
    expect(Array.isArray(response.incidents)).toBe(true)
  },

  /**
   * エラーオブジェクトの検証
   */
  expectError(error: any, expectedMessage?: string) {
    expect(error).toBeInstanceOf(Error)
    if (expectedMessage) {
      expect(error.message).toContain(expectedMessage)
    }
  }
}

// コンソール関連のテストヘルパー
export const consoleHelpers = {
  /**
   * コンソール出力のキャプチャ
   */
  captureConsole() {
    const mockConsole = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn()
    }
    
    vi.stubGlobal('console', mockConsole)
    return mockConsole
  },

  /**
   * コンソール出力の検証
   */
  expectConsoleOutput(mockConsole: any, method: 'log' | 'error' | 'warn' | 'info', expectedText?: string) {
    expect(mockConsole[method]).toHaveBeenCalled()
    if (expectedText) {
      expect(mockConsole[method]).toHaveBeenCalledWith(
        expect.stringContaining(expectedText)
      )
    }
  },

  /**
   * コンソールが呼ばれていないことを検証
   */
  expectNoConsoleOutput(mockConsole: any, method: 'log' | 'error' | 'warn' | 'info') {
    expect(mockConsole[method]).not.toHaveBeenCalled()
  }
}

// テスト実行関連のヘルパー
export const testHelpers = {
  /**
   * 非同期関数のタイムアウトテスト
   */
  async expectTimeout(asyncFn: () => Promise<any>, timeout = 1000) {
    const timeoutPromise = new Promise((_, reject) => 
      globalThis.setTimeout(() => reject(new Error('Test timed out')), timeout)
    )
    
    await expect(Promise.race([asyncFn(), timeoutPromise])).rejects.toThrow('Test timed out')
  },

  /**
   * リトライ処理のテスト
   */
  createFailingFunction(failCount: number, successResult: any = 'success') {
    let callCount = 0
    return vi.fn(() => {
      callCount++
      if (callCount <= failCount) {
        throw new Error(`Attempt ${callCount} failed`)
      }
      return successResult
    })
  },

  /**
   * 遅延処理のテスト
   */
  async withDelay<T>(fn: () => T, delay = 100): Promise<T> {
    await new Promise(resolve => globalThis.setTimeout(resolve, delay))
    return fn()
  }
}

// クリーンアップヘルパー
export const cleanupHelpers = {
  /**
   * すべてのモックをリセット
   */
  resetAllMocks() {
    vi.clearAllMocks()
    vi.resetAllMocks()
    vi.restoreAllMocks()
  },

  /**
   * グローバルなモックをクリーンアップ
   */
  cleanupGlobalMocks() {
    vi.unstubAllGlobals()
  },

  /**
   * 時間関連のモックをクリーンアップ
   */
  cleanupTimers() {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  },

  /**
   * 完全なクリーンアップ
   */
  fullCleanup() {
    this.resetAllMocks()
    this.cleanupGlobalMocks()
    this.cleanupTimers()
  }
}

// デバッグヘルパー
export const debugHelpers = {
  /**
   * オブジェクトの構造を出力
   */
  logObjectStructure(obj: any, label = 'Object') {
    console.log(`${label} structure:`, JSON.stringify(obj, null, 2))
  },

  /**
   * モックの呼び出し履歴を出力
   */
  logMockCalls(mock: any, label = 'Mock') {
    console.log(`${label} calls:`, mock.mock.calls)
    console.log(`${label} results:`, mock.mock.results)
  },

  /**
   * テストの前提条件チェック
   */
  checkTestPreconditions(conditions: Record<string, any>) {
    Object.entries(conditions).forEach(([name, condition]) => {
      if (!condition) {
        throw new Error(`Test precondition failed: ${name}`)
      }
    })
  }
}