// テスト環境用の設定

export const testEnvironment = {
  nodeEnv: 'test',
  apiBaseUrl: 'https://test-status.anthropic.com/api/v2',
  cacheEnabled: false,
  logLevel: 'silent' as const,
  timezone: 'Asia/Tokyo',
  locale: 'ja-JP'
} as const

export const mockEnvironmentVariables = {
  NODE_ENV: 'test',
  CCSTATUS_API_BASE_URL: 'https://test-status.anthropic.com/api/v2',
  CCSTATUS_CACHE_TTL: '60',
  CCSTATUS_LOG_LEVEL: 'silent',
  CCSTATUS_TIMEZONE: 'Asia/Tokyo'
}

export const setupTestEnvironment = () => {
  // 環境変数を設定
  Object.entries(mockEnvironmentVariables).forEach(([key, value]) => {
    process.env[key] = value
  })
}

export const cleanupTestEnvironment = () => {
  // 環境変数をクリーンアップ
  Object.keys(mockEnvironmentVariables).forEach(key => {
    delete process.env[key]
  })
  
  // NODE_ENVはテスト用に戻す
  process.env.NODE_ENV = 'test'
}

export const withTestEnvironment = <T>(fn: () => T): T => {
  setupTestEnvironment()
  try {
    return fn()
  } finally {
    cleanupTestEnvironment()
  }
}