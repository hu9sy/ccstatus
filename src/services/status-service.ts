import type { Incident, IncidentsResponse, StatusSummary } from '../lib/types.ts';
import { MESSAGES } from '../lib/messages.ts';
import { API_CONSTANTS } from '../lib/constants.ts';
import { logger } from '../lib/logger.ts';
import { getApiConfig } from '../lib/config.ts';
import type { Cache } from '../lib/cache.ts';

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

export interface IStatusService {
  getIncidents(): Promise<Incident[]>;
  getServiceStatus(): Promise<StatusSummary>;
  getIncidentsWithLimit(incidents: Incident[], limit: number): Incident[];
}

export class StatusService implements IStatusService {
  constructor(private cache?: Cache) {}

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

  getIncidentsWithLimit(incidents: Incident[], limit: number): Incident[] {
    return incidents.slice(0, limit);
  }
}
