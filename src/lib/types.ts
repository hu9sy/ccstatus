// Anthropic Status API型定義

// 基本コンポーネント定義
export interface BaseComponent {
  id: string;
  name: string;
  status: ComponentStatus;
}

export interface Component extends BaseComponent {
  created_at: string;
  updated_at: string;
  position: number;
  description: string | null;
  showcase: boolean;
  start_date: string | null;
  group_id: string | null;
  page_id: string;
  group: boolean;
  only_show_if_degraded: boolean;
}

// IncidentComponentはBaseComponentを継承（重複削減）
export type IncidentComponent = BaseComponent;

export interface IncidentUpdate {
  id: string;
  status: IncidentStatus;
  body: string;
  created_at: string;
  display_at: string;
  affected_components: IncidentComponent[];
}

export interface Incident {
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

export interface StatusSummary {
  page: StatusPage;
  components: Component[];
  incidents: Incident[];
  scheduled_maintenances: ScheduledMaintenance[];
  status: {
    indicator: ServiceIndicator;
    description: string;
  };
}

export interface IncidentsResponse {
  page: StatusPage;
  incidents: Incident[];
}

// ステータス型定義
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
export type ImpactLevel = 'none' | 'minor' | 'major' | 'critical';
export type ComponentStatus = 'operational' | 'degraded_performance' | 'partial_outage' | 'major_outage';

// ServiceIndicatorとImpactLevelの統合（値が同じため）
export type ServiceIndicator = ImpactLevel;

// 型ガード関数
export function isValidIncidentStatus(status: string): status is IncidentStatus {
  return ['investigating', 'identified', 'monitoring', 'resolved', 'postmortem'].includes(status);
}

export function isValidImpactLevel(level: string): level is ImpactLevel {
  return ['none', 'minor', 'major', 'critical'].includes(level);
}

export function isValidComponentStatus(status: string): status is ComponentStatus {
  return ['operational', 'degraded_performance', 'partial_outage', 'major_outage'].includes(status);
}

export function isValidServiceIndicator(indicator: string): indicator is ServiceIndicator {
  return isValidImpactLevel(indicator);
}

// 型バリデーション関数
export function validateComponent(data: unknown): data is Component {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    isValidComponentStatus(data.status) &&
    typeof data.created_at === 'string' &&
    typeof data.updated_at === 'string'
  );
}

export function validateIncident(data: unknown): data is Incident {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    isValidIncidentStatus(data.status) &&
    isValidImpactLevel(data.impact) &&
    Array.isArray(data.incident_updates) &&
    Array.isArray(data.components)
  );
}