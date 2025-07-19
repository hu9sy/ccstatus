export const MESSAGES = {
  // インシデント関連
  INCIDENT: {
    FETCHING: '📋 Anthropic Status API からインシデント情報を取得中...',
    NO_INCIDENTS: '✅ インシデントは見つかりませんでした。すべてのサービスが正常に稼働しています。',
    DISPLAY_HEADER: (count: number) => `📊 最新のインシデント ${count} 件を表示:`,
    FETCH_ERROR: '❌ インシデント情報の取得に失敗しました:',
    UNKNOWN_ERROR: '不明なエラーが発生しました',
    CONNECTION_HINT: '💡 インターネット接続を確認して、再度お試しください。',
    
    // ステータス表示
    STATUS: {
      INVESTIGATING: '調査中',
      IDENTIFIED: '原因特定',
      MONITORING: '監視中',
      RESOLVED: '解決済み',
      POSTMORTEM: '事後分析',
    },
    
    // ラベル
    LABELS: {
      STATUS: 'ステータス',
      IMPACT: '影響度',
      CREATED_AT: '発生日時',
      RESOLVED_AT: '解決日時',
      LATEST_UPDATE: '最新更新',
      DETAILS: '詳細',
      UNRESOLVED: '未解決',
    },
  },
  
  // サービス関連
  SERVICE: {
    COMPONENTS_HEADER: 'サービスコンポーネント:',
    ACTIVE_INCIDENTS: 'アクティブなインシデント:',
    SCHEDULED_MAINTENANCE: '予定されたメンテナンス:',
    FETCH_ERROR: 'Error fetching service status:',
    
    // テーブルヘッダー
    TABLE_HEADERS: {
      COMPONENT: 'コンポーネント',
      STATUS: 'ステータス',
      UPDATED_AT: '更新日時',
      DESCRIPTION: '備考',
    },
  },
  
  // 共通
  COMMON: {
    HTTP_ERROR: (status: number, statusText: string) => `HTTP ${status}: ${statusText}`,
    UTC_SUFFIX: ' UTC',
  },
} as const;