// 設定管理システム
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

export interface AppConfig {
  // API設定
  apiBaseUrl: string;
  apiTimeout: number;
  maxRetries: number;
  retryDelayMs: number;
  
  // キャッシュ設定
  cacheEnabled: boolean;
  cacheTtlSeconds: number;
  cacheMaxSize: number;
  
  // ログ設定
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  logFilePath?: string;
  
  // UI設定
  locale: string;
  dateFormat: string;
  colorOutput: boolean;
  
  // 制限設定
  maxIncidents: number;
  maxComponents: number;
}

// デフォルト設定
const DEFAULT_CONFIG: AppConfig = {
  // API設定
  apiBaseUrl: 'https://status.anthropic.com/api/v2',
  apiTimeout: 10000,
  maxRetries: 3,
  retryDelayMs: 1000,
  
  // キャッシュ設定
  cacheEnabled: true,
  cacheTtlSeconds: 300, // 5分
  cacheMaxSize: 100,
  
  // ログ設定
  logLevel: 'INFO',
  
  // UI設定
  locale: 'ja-JP',
  dateFormat: 'YYYY-MM-DD HH:mm:ss',
  colorOutput: true,
  
  // 制限設定
  maxIncidents: 50,
  maxComponents: 100,
};

// 環境変数マッピング
const ENV_MAPPING: Record<string, keyof AppConfig> = {
  'CCSTATUS_API_BASE_URL': 'apiBaseUrl',
  'CCSTATUS_API_TIMEOUT': 'apiTimeout',
  'CCSTATUS_MAX_RETRIES': 'maxRetries',
  'CCSTATUS_RETRY_DELAY': 'retryDelayMs',
  'CCSTATUS_CACHE_ENABLED': 'cacheEnabled',
  'CCSTATUS_CACHE_TTL': 'cacheTtlSeconds',
  'CCSTATUS_CACHE_MAX_SIZE': 'cacheMaxSize',
  'CCSTATUS_LOG_LEVEL': 'logLevel',
  'CCSTATUS_LOG_FILE': 'logFilePath',
  'CCSTATUS_LOCALE': 'locale',
  'CCSTATUS_DATE_FORMAT': 'dateFormat',
  'CCSTATUS_COLOR_OUTPUT': 'colorOutput',
  'CCSTATUS_MAX_INCIDENTS': 'maxIncidents',
  'CCSTATUS_MAX_COMPONENTS': 'maxComponents',
};

class ConfigManager {
  private config: AppConfig;
  private configPaths: string[] = [
    resolve(process.cwd(), 'ccstatus.config.json'),
    resolve(process.cwd(), '.ccstatus.json'),
    resolve(process.env.HOME || '~', '.config/ccstatus/config.json'),
  ];

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    // デフォルト設定から開始
    let config = { ...DEFAULT_CONFIG };
    
    // 設定ファイルを読み込み
    config = this.loadFromFile(config);
    
    // 環境変数で上書き
    config = this.loadFromEnv(config);
    
    // 設定をバリデーション
    this.validateConfig(config);
    
    return config;
  }

  private loadFromFile(config: AppConfig): AppConfig {
    for (const configPath of this.configPaths) {
      if (existsSync(configPath)) {
        try {
          const fileContent = readFileSync(configPath, 'utf-8');
          const fileConfig = JSON.parse(fileContent);
          config = { ...config, ...fileConfig };
          console.log(`設定ファイルを読み込みました: ${configPath}`);
          break;
        } catch (error) {
          console.warn(`設定ファイルの読み込みに失敗しました: ${configPath}`, error);
        }
      }
    }
    return config;
  }

  private loadFromEnv(config: AppConfig): AppConfig {
    for (const [envKey, configKey] of Object.entries(ENV_MAPPING)) {
      const envValue = process.env[envKey];
      if (envValue !== undefined) {
        config = this.parseEnvValue(config, configKey, envValue);
      }
    }
    return config;
  }

  private parseEnvValue(config: AppConfig, key: keyof AppConfig, value: string): AppConfig {
    const newConfig = { ...config };
    
    switch (key) {
      case 'apiTimeout':
      case 'maxRetries':
      case 'retryDelayMs':
      case 'cacheTtlSeconds':
      case 'cacheMaxSize':
      case 'maxIncidents':
      case 'maxComponents':
        newConfig[key] = parseInt(value, 10);
        break;
      case 'cacheEnabled':
      case 'colorOutput':
        newConfig[key] = value.toLowerCase() === 'true';
        break;
      case 'logLevel':
        if (['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(value)) {
          newConfig[key] = value as 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
        }
        break;
      default:
        (newConfig as Record<string, unknown>)[key] = value;
    }
    
    return newConfig;
  }

  private validateConfig(config: AppConfig): void {
    const errors: string[] = [];

    // URL検証
    try {
      new URL(config.apiBaseUrl);
    } catch {
      errors.push('apiBaseUrl must be a valid URL');
    }

    // 数値範囲検証
    if (config.apiTimeout < 1000 || config.apiTimeout > 60000) {
      errors.push('apiTimeout must be between 1000 and 60000ms');
    }
    
    if (config.maxRetries < 0 || config.maxRetries > 10) {
      errors.push('maxRetries must be between 0 and 10');
    }
    
    if (config.cacheTtlSeconds < 0) {
      errors.push('cacheTtlSeconds must be positive');
    }
    
    if (config.cacheMaxSize < 1) {
      errors.push('cacheMaxSize must be at least 1');
    }

    // ログレベル検証
    if (!['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(config.logLevel)) {
      errors.push('logLevel must be DEBUG, INFO, WARN, or ERROR');
    }

    if (errors.length > 0) {
      throw new Error(`設定エラー:\n${errors.join('\n')}`);
    }
  }

  // 公開メソッド
  public get(): AppConfig {
    return { ...this.config };
  }

  public getApiConfig() {
    return {
      baseUrl: this.config.apiBaseUrl,
      timeout: this.config.apiTimeout,
      maxRetries: this.config.maxRetries,
      retryDelayMs: this.config.retryDelayMs,
    };
  }

  public getCacheConfig() {
    return {
      enabled: this.config.cacheEnabled,
      ttlSeconds: this.config.cacheTtlSeconds,
      maxSize: this.config.cacheMaxSize,
    };
  }

  public getLogConfig() {
    return {
      level: this.config.logLevel,
      filePath: this.config.logFilePath,
    };
  }

  public getUIConfig() {
    return {
      locale: this.config.locale,
      dateFormat: this.config.dateFormat,
      colorOutput: this.config.colorOutput,
    };
  }

  public getLimits() {
    return {
      maxIncidents: this.config.maxIncidents,
      maxComponents: this.config.maxComponents,
    };
  }

  // 設定の動的更新（必要に応じて）
  public updateConfig(updates: Partial<AppConfig>): void {
    const newConfig = { ...this.config, ...updates };
    this.validateConfig(newConfig);
    this.config = newConfig;
  }

  // デバッグ用：設定の表示
  public dumpConfig(): void {
    console.log('現在の設定:');
    console.log(JSON.stringify(this.config, null, 2));
  }
}

// シングルトンインスタンス
export const configManager = new ConfigManager();

// 便利関数のエクスポート
export const getConfig = () => configManager.get();
export const getApiConfig = () => configManager.getApiConfig();
export const getCacheConfig = () => configManager.getCacheConfig();
export const getLogConfig = () => configManager.getLogConfig();
export const getUIConfig = () => configManager.getUIConfig();
export const getLimits = () => configManager.getLimits();