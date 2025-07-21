/**
 * @fileoverview Anthropic Status API の型定義
 * Anthropic ステータスページ API のレスポンス構造を定義します
 */

/**
 * 基本コンポーネント情報の共通プロパティ
 */
export interface BaseComponent {
  /** コンポーネントの一意識別子 */
  id: string;
  /** コンポーネント名 */
  name: string;
  /** 現在のステータス */
  status: ComponentStatus;
}

/**
 * 完全なコンポーネント情報
 * Anthropic ステータスページで管理される各サービスコンポーネントの詳細
 */
export interface Component extends BaseComponent {
  /** 作成日時（ISO8601形式） */
  created_at: string;
  /** 更新日時（ISO8601形式） */
  updated_at: string;
  /** 表示順序 */
  position: number;
  /** コンポーネントの説明 */
  description: string | null;
  /** ステータスページでの表示対象かどうか */
  showcase: boolean;
  /** 開始日（ISO8601形式） */
  start_date: string | null;
  /** グループID（グループ化されている場合） */
  group_id: string | null;
  /** 所属ページID */
  page_id: string;
  /** グループコンポーネントかどうか */
  group: boolean;
  /** パフォーマンス低下時のみ表示するかどうか */
  only_show_if_degraded: boolean;
}

/**
 * インシデント内で参照されるコンポーネント情報
 * BaseComponent を継承した軽量版（重複削減）
 */
export type IncidentComponent = BaseComponent;

/**
 * インシデント更新情報
 * インシデントのステータス変更や進捗報告を表します
 */
export interface IncidentUpdate {
  /** 更新情報の一意識別子 */
  id: string;
  /** 更新時点でのインシデントステータス */
  status: IncidentStatus;
  /** 更新内容の本文 */
  body: string;
  /** 更新作成日時（ISO8601形式） */
  created_at: string;
  /** 表示予定日時（ISO8601形式） */
  display_at: string;
  /** 影響を受けるコンポーネント一覧 */
  affected_components: IncidentComponent[];
}

/**
 * インシデント情報
 * Anthropic サービスで発生した障害や問題の詳細情報
 */
export interface Incident {
  /** インシデントの一意識別子 */
  id: string;
  /** インシデント名・タイトル */
  name: string;
  /** 現在のステータス */
  status: IncidentStatus;
  /** 作成日時（ISO8601形式） */
  created_at: string;
  /** 最終更新日時（ISO8601形式） */
  updated_at: string;
  /** 監視開始日時（ISO8601形式、null の場合は未監視） */
  monitoring_at: string | null;
  /** 解決日時（ISO8601形式、null の場合は未解決） */
  resolved_at: string | null;
  /** 影響レベル */
  impact: ImpactLevel;
  /** 短縮URL */
  shortlink: string;
  /** 開始日時（ISO8601形式） */
  started_at: string;
  /** 所属ページID */
  page_id: string;
  /** インシデント更新履歴 */
  incident_updates: IncidentUpdate[];
  /** 影響を受けるコンポーネント一覧 */
  components: IncidentComponent[];
}

export interface StatusPage {
  id: string;
  name: string;
  url: string;
  time_zone: string;
  updated_at: string;
}

export interface ScheduledMaintenance {
  id: string;
  name: string;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  monitoring_at: string | null;
  resolved_at: string | null;
  impact: ImpactLevel;
  shortlink: string;
  started_at: string;
  page_id: string;
  incident_updates: IncidentUpdate[];
  components: IncidentComponent[];
  scheduled_for: string;
  scheduled_until: string;
}

/**
 * サービスステータスのサマリー情報
 * Anthropic サービス全体の現在状態を含む総合情報
 */
export interface StatusSummary {
  /** ステータスページ情報 */
  page: StatusPage;
  /** 全コンポーネント一覧 */
  components: Component[];
  /** 現在のインシデント一覧 */
  incidents: Incident[];
  /** 予定されたメンテナンス一覧 */
  scheduled_maintenances: ScheduledMaintenance[];
  /** サービス全体のステータス */
  status: {
    /** ステータスインジケーター */
    indicator: ServiceIndicator;
    /** ステータスの説明テキスト */
    description: string;
  };
}

export interface IncidentsResponse {
  page: StatusPage;
  incidents: Incident[];
}

/**
 * インシデントのステータス
 * - investigating: 原因調査中
 * - identified: 原因特定済み
 * - monitoring: 監視中（修正後の状態確認）
 * - resolved: 解決済み
 * - postmortem: 事後分析中
 */
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';

/**
 * 影響レベル
 * - none: 影響なし
 * - minor: 軽微な影響
 * - major: 重大な影響
 * - critical: 致命的な影響
 */
export type ImpactLevel = 'none' | 'minor' | 'major' | 'critical';

/**
 * コンポーネントのステータス
 * - operational: 正常稼働
 * - degraded_performance: パフォーマンス低下
 * - partial_outage: 部分的障害
 * - major_outage: 大規模障害
 */
export type ComponentStatus = 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';

/**
 * サービス全体のステータスインジケーター
 * ImpactLevel と同じ値を使用（重複削減のため統合）
 */
export type ServiceIndicator = ImpactLevel;

/**
 * 型ガード関数
 * ランタイムでの型安全性を保証します
 */

/**
 * 文字列が有効なインシデントステータスかどうかをチェックします
 * @param status - チェックする文字列
 * @returns 有効な IncidentStatus 型かどうか
 */
export function isValidIncidentStatus(status: string): status is IncidentStatus {
  return ['investigating', 'identified', 'monitoring', 'resolved', 'postmortem'].includes(status);
}

/**
 * 文字列が有効な影響レベルかどうかをチェックします
 * @param level - チェックする文字列
 * @returns 有効な ImpactLevel 型かどうか
 */
export function isValidImpactLevel(level: string): level is ImpactLevel {
  return ['none', 'minor', 'major', 'critical'].includes(level);
}

/**
 * 文字列が有効なコンポーネントステータスかどうかをチェックします
 * @param status - チェックする文字列
 * @returns 有効な ComponentStatus 型かどうか
 */
export function isValidComponentStatus(status: string): status is ComponentStatus {
  return ['operational', 'degraded_performance', 'partial_outage', 'major_outage'].includes(status);
}

/**
 * 文字列が有効なサービスインジケーターかどうかをチェックします
 * @param indicator - チェックする文字列
 * @returns 有効な ServiceIndicator 型かどうか
 */
export function isValidServiceIndicator(indicator: string): indicator is ServiceIndicator {
  return isValidImpactLevel(indicator);
}

/**
 * 型バリデーション関数
 * API レスポンスの構造を験証し、型安全性を保証します
 */

/**
 * 未知のデータが Component 型に合致するかどうかを験証します
 * @param data - 験証するデータ
 * @returns Component 型として有効かどうか
 * 
 * @example
 * ```typescript
 * const apiResponse = await fetch('/api/component');
 * const data = await apiResponse.json();
 * if (validateComponent(data)) {
 *   // data は Component 型として安全に使用できます
 *   console.log(data.name);
 * }
 * ```
 */
export function validateComponent(data: unknown): data is Component {
  const component = data as Record<string, unknown>;
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof component.id === 'string' &&
    typeof component.name === 'string' &&
    isValidComponentStatus(component.status as string) &&
    typeof component.created_at === 'string' &&
    typeof component.updated_at === 'string'
  );
}

/**
 * 未知のデータが Incident 型に合致するかどうかを験証します
 * @param data - 験証するデータ
 * @returns Incident 型として有効かどうか
 * 
 * @example
 * ```typescript
 * const apiResponse = await fetch('/api/incidents');
 * const data = await apiResponse.json();
 * if (Array.isArray(data.incidents)) {
 *   const validIncidents = data.incidents.filter(validateIncident);
 *   // validIncidents はすべて Incident 型です
 * }
 * ```
 */
export function validateIncident(data: unknown): data is Incident {
  const incident = data as Record<string, unknown>;
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof incident.id === 'string' &&
    typeof incident.name === 'string' &&
    isValidIncidentStatus(incident.status as string) &&
    isValidImpactLevel(incident.impact as string) &&
    Array.isArray(incident.incident_updates) &&
    Array.isArray(incident.components)
  );
}