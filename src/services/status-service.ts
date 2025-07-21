import type { Incident, IncidentsResponse, StatusSummary, Component } from '../lib/types.ts';
import { MESSAGES } from '../lib/messages.ts';
import { API_CONSTANTS } from '../lib/constants.ts';
import { logger } from '../lib/logger.ts';
import { getApiConfig } from '../lib/config.ts';
import type { Cache } from '../lib/cache.ts';

/**
 * Anthropic Status API からデータを取得する汎用関数
 * @template T - API レスポンスの型
 * @param endpoint - API エンドポイントのパス
 * @returns API レスポンスデータ
 * @throws {Error} ネットワークエラーまたは HTTP エラーの場合
 * 
 * @example
 * ```typescript
 * const data = await fetchAnthropicAPI<StatusSummary>('/summary.json');
 * ```
 */
async function fetchAnthropicAPI<T>(endpoint: string): Promise<T> {
  const config = getApiConfig();
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(`${config.baseUrl}${endpoint}`, {
        signal: AbortSignal.timeout(config.timeout)
      });
      
      if (!response.ok) {
        let errorMessage = MESSAGES.COMMON.HTTP_ERROR(response.status, response.statusText);
        
        try {
          const errorBody = await response.text();
          if (errorBody) {
            errorMessage += ` - レスポンス: ${errorBody}`;
          }
        } catch {
          // レスポンスボディの取得に失敗した場合は無視
        }
        
        // レート制限やサーバーエラーの場合はリトライ
        if ((response.status === 429 || response.status >= 500) && attempt < config.maxRetries) {
          await new Promise(resolve => globalThis.setTimeout(resolve, config.retryDelayMs * attempt));
          continue;
        }
        
        throw new Error(errorMessage);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt === config.maxRetries) {
        if (error instanceof TypeError) {
          throw new Error(`ネットワークエラー: ${error.message}`);
        }
        throw error;
      }
      
      // ネットワークエラーの場合はリトライ
      await new Promise(resolve => globalThis.setTimeout(resolve, config.retryDelayMs * attempt));
    }
  }
  
  throw new Error('予期しないエラーが発生しました');
}

/**
 * Anthropic ステータスサービスの操作を定義するインターフェース
 */
export interface IStatusService {
  /**
   * インシデント履歴を取得します
   * @returns インシデントの配列
   * @throws {Error} API 呼び出しに失敗した場合
   */
  getIncidents(): Promise<Incident[]>;
  
  /**
   * サービス全体のステータスサマリーを取得します
   * @returns ステータスサマリー情報
   * @throws {Error} API 呼び出しに失敗した場合
   */
  getServiceStatus(): Promise<StatusSummary>;
  
  /**
   * インシデントリストを指定された件数に制限します
   * @param incidents - 元のインシデント配列
   * @param limit - 表示する最大件数
   * @returns 制限された件数のインシデント配列
   */
  getIncidentsWithLimit(incidents: Incident[], limit: number): Incident[];

  /**
   * インシデントを Stream 形式で遅延取得します（パフォーマンス最適化）
   * @param limit - 取得する最大件数（指定時は早期終了でメモリ効率化）
   * @returns インシデントの非同期ジェネレーター
   */
  getIncidentsStream(limit?: number): AsyncGenerator<Incident, void, unknown>;

  /**
   * コンポーネント一覧を遅延読み込みで取得します
   * @returns コンポーネントの非同期ジェネレーター
   */
  getComponentsLazy(): AsyncGenerator<Component, void, unknown>;
}

/**
 * Anthropic ステータス API クライアント
 * キャッシュ機能付きでインシデントとサービスステータス情報を提供します
 * 
 * @example
 * ```typescript
 * const service = new StatusService(cache);
 * const incidents = await service.getIncidents();
 * const status = await service.getServiceStatus();
 * ```
 */
export class StatusService implements IStatusService {
  /**
   * StatusService のインスタンスを作成します
   * @param cache - オプションのキャッシュインスタンス（未指定時はキャッシュなし）
   */
  constructor(private cache?: Cache) {}

  /**
   * インシデント履歴を取得します（キャッシュ対応）
   * キャッシュが存在する場合はキャッシュから返し、なければ API を呼び出します
   * @returns インシデントの配列
   * @throws {Error} API 呼び出しまたはネットワークエラーの場合
   */
  async getIncidents(): Promise<Incident[]> {
    const cacheKey = 'incidents';
    
    if (this.cache?.has(cacheKey)) {
      logger.debug('Returning cached incidents');
      return this.cache.get(cacheKey) as Incident[];
    }

    try {
      logger.info('Fetching incidents from API');
      const data = await fetchAnthropicAPI<IncidentsResponse>(API_CONSTANTS.ENDPOINTS.INCIDENTS);
      
      if (this.cache) {
        this.cache.set(cacheKey, data.incidents);
      }
      
      return data.incidents;
    } catch (error) {
      logger.error('Failed to fetch incidents', { endpoint: API_CONSTANTS.ENDPOINTS.INCIDENTS }, error as Error);
      throw error;
    }
  }

  /**
   * サービス全体のステータスサマリーを取得します（キャッシュ対応）
   * キャッシュが存在する場合はキャッシュから返し、なければ API を呼び出します
   * ステータス情報は1分間キャッシュされます
   * @returns ステータスサマリー情報
   * @throws {Error} API 呼び出しまたはネットワークエラーの場合
   */
  async getServiceStatus(): Promise<StatusSummary> {
    const cacheKey = 'service_status';
    
    if (this.cache?.has(cacheKey)) {
      logger.debug('Returning cached service status');
      return this.cache.get(cacheKey) as StatusSummary;
    }

    try {
      logger.info('Fetching service status from API');
      const data = await fetchAnthropicAPI<StatusSummary>(API_CONSTANTS.ENDPOINTS.SUMMARY);
      
      if (this.cache) {
        this.cache.set(cacheKey, data, 60000); // 1 minute cache for status
      }
      
      return data;
    } catch (error) {
      logger.error('Failed to fetch service status', { endpoint: API_CONSTANTS.ENDPOINTS.SUMMARY }, error as Error);
      throw error;
    }
  }

  /**
   * インシデントリストを指定された件数に制限します
   * @param incidents - 元のインシデント配列
   * @param limit - 表示する最大件数（0以下の場合は全件を返す）
   * @returns 制限された件数のインシデント配列（新しいものから順）
   * 
   * @example
   * ```typescript
   * const service = new StatusService();
   * const allIncidents = await service.getIncidents();
   * const recentIncidents = service.getIncidentsWithLimit(allIncidents, 5);
   * ```
   */
  getIncidentsWithLimit(incidents: Incident[], limit: number): Incident[] {
    return incidents.slice(0, limit);
  }

  /**
   * インシデントを Stream 形式で遅延取得します（メモリ効率化）
   * 大量のデータを扱う際に、必要に応じて1件ずつ処理できます
   * @param limit - 取得する最大件数（指定時は早期終了）
   * @returns インシデントの非同期ジェネレーター
   * 
   * @example
   * ```typescript
   * const service = new StatusService(cache);
   * for await (const incident of service.getIncidentsStream(10)) {
   *   console.log(`Processing incident: ${incident.name}`);
   *   // 1件ずつメモリ効率よく処理
   * }
   * ```
   */
  async* getIncidentsStream(limit?: number): AsyncGenerator<Incident, void, unknown> {
    const cacheKey = 'incidents';
    let incidents: Incident[];

    // キャッシュから取得を試行
    if (this.cache?.has(cacheKey)) {
      logger.debug('Using cached incidents for stream');
      incidents = this.cache.get(cacheKey) as Incident[];
    } else {
      try {
        logger.info('Fetching incidents from API for stream');
        const data = await fetchAnthropicAPI<IncidentsResponse>(API_CONSTANTS.ENDPOINTS.INCIDENTS);
        incidents = data.incidents;
        
        if (this.cache) {
          this.cache.set(cacheKey, incidents);
        }
      } catch (error) {
        logger.error('Failed to fetch incidents for stream', { endpoint: API_CONSTANTS.ENDPOINTS.INCIDENTS }, error as Error);
        throw error;
      }
    }

    // Stream として1件ずつ yield（早期終了対応）
    const maxItems = limit && limit > 0 ? Math.min(limit, incidents.length) : incidents.length;
    
    for (let i = 0; i < maxItems; i++) {
      yield incidents[i];
    }
  }

  /**
   * コンポーネント一覧を遅延読み込みで取得します（メモリ効率化）
   * サービスステータスから必要に応じてコンポーネントを1件ずつ処理できます
   * @returns コンポーネントの非同期ジェネレーター
   * 
   * @example
   * ```typescript
   * const service = new StatusService(cache);
   * for await (const component of service.getComponentsLazy()) {
   *   if (component.status !== 'operational') {
   *     console.log(`Issue detected: ${component.name} - ${component.status}`);
   *   }
   * }
   * ```
   */
  async* getComponentsLazy(): AsyncGenerator<Component, void, unknown> {
    const statusSummary = await this.getServiceStatus();
    
    // コンポーネントを1件ずつ遅延読み込みで処理
    for (const component of statusSummary.components) {
      // 必要に応じて追加の処理時間を作る（I/O bound operations など）
      await new Promise(resolve => globalThis.setTimeout(resolve, 0));
      yield component;
    }
  }
}
