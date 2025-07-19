import { consola } from 'consola';
import { formatIncidentForDisplay } from '../lib/utils.js';
import { MESSAGES } from '../lib/messages.js';
import type { Incident } from '../lib/types.js';

export class IncidentPresenter {
  displayIncidents(incidents: Incident[], _originalLimit: number): void {
    if (incidents.length === 0) {
      consola.log(MESSAGES.INCIDENT.NO_INCIDENTS);
      return;
    }

    consola.log(`\n${MESSAGES.INCIDENT.DISPLAY_HEADER(incidents.length)}\n`);

    incidents.forEach((incident, index) => {
      const formatted = formatIncidentForDisplay(incident, index);
      
      consola.log(formatted.title);
      consola.log(`   ${formatted.status}`);
      consola.log(`   ${formatted.impact}`);
      consola.log(`   ${formatted.createdAt}`);
      consola.log(`   ${formatted.resolvedAt}`);
      
      if (formatted.latestUpdate) {
        consola.log(`   ${formatted.latestUpdate}`);
      }
      
      consola.log(`   ${formatted.detailsUrl}\n`);
    });
  }

  displayFetchingMessage(): void {
    consola.log(`${MESSAGES.INCIDENT.FETCHING}\n`);
  }
}