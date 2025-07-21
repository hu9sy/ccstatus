import { beforeEach, afterEach, vi } from 'vitest'
import { setupTestEnvironment, cleanupTestEnvironment } from '../fixtures/config/test-environment.ts'
import { cleanupHelpers } from './test-utils.ts'

// テスト前の共通セットアップ
beforeEach(() => {
  // 環境変数のセットアップ
  setupTestEnvironment()
  
  // モックのリセット
  vi.clearAllMocks()
  
  // コンソール出力を抑制（テスト中の不要な出力を防ぐ）
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

// テスト後のクリーンアップ
afterEach(() => {
  // 完全なクリーンアップ
  cleanupHelpers.fullCleanup()
  
  // 環境変数のクリーンアップ
  cleanupTestEnvironment()
  
  // コンソールモックの復元
  vi.restoreAllMocks()
})