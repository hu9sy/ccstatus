# テストヘルパーとフィクスチャの使用方法

このディレクトリには、テストを効率的に書くためのヘルパー関数とフィクスチャデータが含まれています。

## ファイル構成

```
tests/
├── fixtures/
│   ├── api-responses/          # APIレスポンスのフィクスチャ
│   │   ├── service-status.json
│   │   ├── incidents.json
│   │   ├── error-responses.json
│   │   └── edge-cases.json
│   └── config/                 # テスト設定ファイル
│       ├── test-config.json
│       └── test-environment.ts
└── helpers/
    ├── fixtures.ts             # 基本的なテストデータ
    ├── mocks.ts               # モックファクトリー関数
    ├── test-utils.ts          # テストユーティリティ関数
    ├── data-generators.ts     # 動的テストデータ生成
    └── setup.ts               # 共通のテスト設定
```

## 基本的な使用方法

### 1. フィクスチャデータの使用

```typescript
import { testDates, testStatuses } from '../helpers/fixtures.ts'

describe('日付フォーマットテスト', () => {
  it('UTC時刻を正しくフォーマットする', () => {
    const formatted = formatDate(testDates.utc)
    expect(formatted).toBe('2025-07-21 21:00:00')
  })
})
```

### 2. モックファクトリーの使用

```typescript
import { createMockComponent, createMockIncident, createMockFetch } from '../helpers/mocks.ts'

describe('StatusService', () => {
  it('コンポーネント一覧を取得する', async () => {
    const mockComponent = createMockComponent({ 
      name: 'Test API', 
      status: 'operational' 
    })
    
    const mockFetch = createMockFetch([mockComponent])
    vi.stubGlobal('fetch', mockFetch)
    
    // テスト実行...
  })
})
```

### 3. テストユーティリティの使用

```typescript
import { apiHelpers, assertionHelpers, timeHelpers } from '../helpers/test-utils.ts'

describe('API エラーハンドリング', () => {
  beforeEach(() => {
    timeHelpers.mockCurrentTime('2025-07-21T12:00:00.000Z')
  })

  afterEach(() => {
    timeHelpers.restoreTime()
  })

  it('ネットワークエラーを適切に処理する', async () => {
    const mockFetch = apiHelpers.mockFetch(new Error('Network Error'))
    
    await expect(statusService.getComponents()).rejects.toThrow('Network Error')
    assertionHelpers.expectError(error, 'Network Error')
  })
})
```

### 4. データジェネレーターの使用

```typescript
import { generateComponent, generateIncident, scenarios } from '../helpers/data-generators.ts'

describe('大量データの処理', () => {
  it('多数のコンポーネントを正しく処理する', () => {
    // ランダムなテストデータを生成
    const components = Array.from({ length: 100 }, () => generateComponent())
    
    const result = processComponents(components)
    expect(result.length).toBe(100)
  })

  it('障害シナリオを正しく表示する', () => {
    // 事前定義されたシナリオを使用
    const outageScenario = scenarios.majorOutage()
    
    const display = formatStatus(outageScenario)
    expect(display).toContain('Major service disruption')
  })
})
```

## 高度な機能

### エラーレスポンスのテスト

```typescript
import errorResponses from '../fixtures/api-responses/error-responses.json'
import { apiHelpers } from '../helpers/test-utils.ts'

describe('エラーハンドリング', () => {
  it('HTTP 500エラーを処理する', async () => {
    const errorResponse = apiHelpers.createErrorResponse(500, 'Internal Server Error')
    const mockFetch = apiHelpers.mockFetch(errorResponse)
    
    await expect(apiCall()).rejects.toThrow('Internal Server Error')
  })

  it('ネットワークタイムアウトを処理する', async () => {
    await apiHelpers.expectTimeout(() => slowApiCall(), 1000)
  })
})
```

### リトライロジックのテスト

```typescript
import { createRetryableMock, testHelpers } from '../helpers/test-utils.ts'

describe('リトライ機能', () => {
  it('3回失敗後に成功する', async () => {
    const mockFn = testHelpers.createFailingFunction(3, 'success')
    
    // リトライロジックのテスト
    const result = await retryableOperation(mockFn)
    
    expect(mockFn).toHaveBeenCalledTimes(4) // 3回失敗 + 1回成功
    expect(result).toBe('success')
  })
})
```

### 環境固有のテスト

```typescript
import { withTestEnvironment } from '../fixtures/config/test-environment.ts'

describe('設定依存のテスト', () => {
  it('テスト環境設定で動作する', () => {
    withTestEnvironment(() => {
      // テスト環境の設定が適用された状態で実行
      const config = getConfig()
      expect(config.apiBaseUrl).toBe('https://test-status.anthropic.com/api/v2')
    })
  })
})
```

## ベストプラクティス

1. **適切なフィクスチャの選択**: 静的データには fixtures、動的データには generators を使用
2. **モックの管理**: 各テストで適切にクリーンアップし、テスト間の干渉を防ぐ
3. **エラーケースの考慮**: 正常系だけでなく異常系も含めてテストする
4. **データの現実性**: 実際のAPIレスポンスに近いテストデータを使用する
5. **テストの可読性**: 意図が明確に分かるヘルパー関数を使用する

## トラブルシューティング

### よくある問題

1. **モックが期待通りに動作しない**
   - `cleanupHelpers.resetAllMocks()` でモックをリセット
   - テスト間でのモック状態の干渉を確認

2. **時間関連のテストが不安定**
   - `timeHelpers.mockCurrentTime()` で時刻を固定
   - テスト後は `timeHelpers.restoreTime()` で復元

3. **非同期テストのタイムアウト**
   - `expectTimeout()` ヘルパーを使用
   - 適切なタイムアウト値を設定

### デバッグ支援

```typescript
import { debugHelpers } from '../helpers/test-utils.ts'

// オブジェクト構造の確認
debugHelpers.logObjectStructure(responseData, 'API Response')

// モック呼び出しの確認
debugHelpers.logMockCalls(mockFetch, 'Fetch Mock')

// テスト前提条件の確認
debugHelpers.checkTestPreconditions({
  'API is mocked': !!mockFetch,
  'Data is valid': validateData(testData)
})
```