import type { Incident, IncidentsResponse, StatusSummary } from '../lib/types.ts';
import { MESSAGES } from '../lib/messages.ts';
import { API_CONSTANTS } from '../lib/constants.ts';

async function fetchAnthropicAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_CONSTANTS.ANTHROPIC_API_BASE}${endpoint}`);
  
  if (!response.ok) {
    throw new Error(MESSAGES.COMMON.HTTP_ERROR(response.status, response.statusText));
  }
  
  return await response.json();
}

export class StatusService {
  async getIncidents(): Promise<Incident[]> {
    const data = await fetchAnthropicAPI<IncidentsResponse>(API_CONSTANTS.ENDPOINTS.INCIDENTS);
    return data.incidents;
  }

  async getServiceStatus(): Promise<StatusSummary> {
    return await fetchAnthropicAPI<StatusSummary>(API_CONSTANTS.ENDPOINTS.SUMMARY);
  }

  getIncidentsWithLimit(incidents: Incident[], limit: number): Incident[] {
    return incidents.slice(0, limit);
  }
}