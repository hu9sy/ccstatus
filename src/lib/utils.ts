import { consola } from 'consola';
import type { Incident, IncidentsResponse, StatusSummary, IncidentStatus, ImpactLevel } from './types.js';
import { MESSAGES } from './messages.js';

// API取得ユーティリティ
export async function fetchIncidents(): Promise<Incident[]> {
  const response = await fetch('https://status.anthropic.com/api/v2/incidents.json');

  if (!response.ok) {
    throw new Error(MESSAGES.COMMON.HTTP_ERROR(response.status, response.statusText));
  }

  const data: IncidentsResponse = await response.json();
  return data.incidents;
}

export async function fetchServiceStatus(): Promise<StatusSummary> {
  const response = await fetch('https://status.anthropic.com/api/v2/summary.json');

  if (!response.ok) {
    throw new Error(MESSAGES.COMMON.HTTP_ERROR(response.status, response.statusText));
  }

  return await response.json();
}

// アイコン・ステータス表示ユーティリティ
export function getStatusIcon(status: string): string {
  switch (status as IncidentStatus) {
    case 'investigating':
      return '🔍';
    case 'identified':
      return '🔎';
    case 'monitoring':
      return '👀';
    case 'resolved':
      return '✅';
    case 'postmortem':
      return '📝';
    default:
      return '❓';
  }
}

export function getImpactIcon(impact: string): string {
  switch (impact as ImpactLevel) {
    case 'none':
      return '🟢';
    case 'minor':
      return '🟡';
    case 'major':
      return '🟠';
    case 'critical':
      return '🔴';
    default:
      return '⚪';
  }
}

export function getStatusText(status: string): string {
  const statusMap = MESSAGES.INCIDENT.STATUS;
  return statusMap[status as keyof typeof statusMap] || status;
}

// 時刻フォーマットユーティリティ
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const jstTime = date.toLocaleString('ja-JP');
  const utcTime = date.toISOString().slice(0, 19).replace('T', ' ') + MESSAGES.COMMON.UTC_SUFFIX;
  return `${jstTime} (${utcTime})`;
}

export function formatDateTimeWithUTC(dateString: string): string {
  const date = new Date(dateString);
  const jstTime = date.toLocaleString('ja-JP');
  const utcTime = date.toISOString().slice(0, 19).replace('T', ' ') + MESSAGES.COMMON.UTC_SUFFIX;
  return `${jstTime}\n(${utcTime})`;
}

// インシデント表示フォーマット
export interface FormattedIncident {
  title: string;
  status: string;
  impact: string;
  createdAt: string;
  resolvedAt: string;
  latestUpdate?: string;
  detailsUrl: string;
}

export function formatIncidentForDisplay(incident: Incident, index: number): FormattedIncident {
  const statusIcon = getStatusIcon(incident.status);
  const impactIcon = getImpactIcon(incident.impact);
  const createdDate = formatDateTime(incident.created_at);
  const resolvedDate = incident.resolved_at
    ? formatDateTime(incident.resolved_at)
    : MESSAGES.INCIDENT.LABELS.UNRESOLVED;

  let latestUpdate: string | undefined;
  if (incident.incident_updates.length > 0) {
    const update = incident.incident_updates[0];
    const updateDate = formatDateTime(update.created_at);
    latestUpdate = `${getStatusText(update.status)} (${updateDate})`;
  }

  return {
    title: `${index + 1}. ${statusIcon} ${incident.name}`,
    status: `${MESSAGES.INCIDENT.LABELS.STATUS}: ${getStatusText(incident.status)}`,
    impact: `${MESSAGES.INCIDENT.LABELS.IMPACT}: ${impactIcon} ${incident.impact}`,
    createdAt: `${MESSAGES.INCIDENT.LABELS.CREATED_AT}: ${createdDate}`,
    resolvedAt: `${MESSAGES.INCIDENT.LABELS.RESOLVED_AT}: ${resolvedDate}`,
    latestUpdate: latestUpdate ? `${MESSAGES.INCIDENT.LABELS.LATEST_UPDATE}: ${latestUpdate}` : undefined,
    detailsUrl: `${MESSAGES.INCIDENT.LABELS.DETAILS}: ${incident.shortlink}`,
  };
}

// エラーハンドリングユーティリティ
export function handleError(error: unknown, context: string): void {
  consola.error(context);

  if (error instanceof Error) {
    consola.error(`   ${error.message}`);
  } else {
    consola.error(`   ${MESSAGES.INCIDENT.UNKNOWN_ERROR}`);
  }

  consola.error(`\n${MESSAGES.INCIDENT.CONNECTION_HINT}`);
}