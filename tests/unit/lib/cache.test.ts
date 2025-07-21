import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { Cache } from '../../../src/lib/cache.ts'

// config.ts をモック
vi.mock('../../../src/lib/config.ts', () => ({
  getCacheConfig: () => ({
    ttlSeconds: 300,
    maxSize: 10
  })
}))

describe('Cache', () => {
  let cache: Cache<string>
  
  beforeEach(() => {
    vi.useFakeTimers()
    cache = new Cache<string>()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('基本操作', () => {
    it('値の設定と取得ができる', () => {
      cache.set('key1', 'value1')
      expect(cache.get('key1')).toBe('value1')
    })

    it('存在しないキーでundefinedを返す', () => {
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('キーの存在確認ができる', () => {
      cache.set('key1', 'value1')
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('値の削除ができる', () => {
      cache.set('key1', 'value1')
      expect(cache.delete('key1')).toBe(true)
      expect(cache.get('key1')).toBeUndefined()
      expect(cache.delete('nonexistent')).toBe(false)
    })

    it('キャッシュのクリアができる', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      cache.clear()
      expect(cache.size()).toBe(0)
      expect(cache.get('key1')).toBeUndefined()
    })
  })

  describe('TTL（有効期限）機能', () => {
    it('TTL内では値を取得できる', () => {
      cache.set('key1', 'value1')
      
      // 5分以内（TTLデフォルト300秒 = 5分）
      vi.advanceTimersByTime(4 * 60 * 1000) // 4分
      expect(cache.get('key1')).toBe('value1')
    })

    it('TTL経過後は値が取得できない', () => {
      cache.set('key1', 'value1')
      
      // TTL経過（5分 + 1秒）
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('カスタムTTLが正しく動作する', () => {
      const customTtl = 10000 // 10秒
      cache.set('key1', 'value1', customTtl)
      
      // 9秒後は有効
      vi.advanceTimersByTime(9000)
      expect(cache.get('key1')).toBe('value1')
      
      // 11秒後は無効
      vi.advanceTimersByTime(2000)
      expect(cache.get('key1')).toBeUndefined()
    })

    it('期限切れエントリのhas()がfalseを返す', () => {
      cache.set('key1', 'value1')
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000) // TTL経過
      expect(cache.has('key1')).toBe(false)
    })
  })

  describe('LRU機能', () => {
    it('最大エントリ数を超えると古いエントリが削除される', () => {
      const smallCache = new Cache<string>({ maxEntries: 3 })
      
      smallCache.set('key1', 'value1')
      smallCache.set('key2', 'value2')
      smallCache.set('key3', 'value3')
      expect(smallCache.size()).toBe(3)
      
      // 4つ目を追加すると最古のkey1が削除される
      smallCache.set('key4', 'value4')
      expect(smallCache.size()).toBe(3)
      expect(smallCache.get('key1')).toBeUndefined()
      expect(smallCache.get('key4')).toBe('value4')
    })
  })

  describe('自動クリーンアップ', () => {
    it('期限切れエントリが自動的に削除される', () => {
      cache.set('key1', 'value1', 1000) // 1秒TTL
      cache.set('key2', 'value2', 5000) // 5秒TTL
      
      expect(cache.size()).toBe(2)
      
      // 2秒経過：key1が期限切れ
      vi.advanceTimersByTime(2000)
      expect(cache.size()).toBe(1) // クリーンアップが動作
      expect(cache.keys()).toEqual(['key2'])
    })
  })

  describe('統計情報', () => {
    it('正しい統計情報を返す', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')
      
      const stats = cache.getStats()
      expect(stats.size).toBe(2)
      expect(stats.maxEntries).toBe(10) // デフォルト値
      expect(stats.ttlMs).toBe(300 * 1000) // デフォルト値（ミリ秒）
      expect(stats.keys).toEqual(['key1', 'key2'])
    })

    it('期限切れエントリを除いた統計情報を返す', () => {
      cache.set('key1', 'value1', 1000)
      cache.set('key2', 'value2', 5000)
      
      vi.advanceTimersByTime(2000) // key1期限切れ
      
      const stats = cache.getStats()
      expect(stats.size).toBe(1)
      expect(stats.keys).toEqual(['key2'])
    })
  })

  describe('コンストラクタオプション', () => {
    it('カスタムオプションが正しく設定される', () => {
      const customCache = new Cache<string>({
        ttlMs: 60000, // 1分
        maxEntries: 5
      })
      
      const stats = customCache.getStats()
      expect(stats.ttlMs).toBe(60000)
      expect(stats.maxEntries).toBe(5)
    })
  })

  describe('型安全性', () => {
    it('異なる型のキャッシュが正しく動作する', () => {
      const numberCache = new Cache<number>()
      const objectCache = new Cache<{ id: string; value: string }>()
      
      numberCache.set('num', 42)
      objectCache.set('obj', { id: '1', value: 'test' })
      
      expect(numberCache.get('num')).toBe(42)
      expect(objectCache.get('obj')).toEqual({ id: '1', value: 'test' })
    })
  })
})