// Anthropic Status API型定義

export interface Component {
  id: string;
  name: string;
  status: ComponentStatus;
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

export interface IncidentComponent {
  id: string;
  name: string;
  status: ComponentStatus;
}

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
export type ServiceIndicator = 'none' | 'minor' | 'major' | 'critical';