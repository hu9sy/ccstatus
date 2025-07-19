import { define } from 'gunshi';
import { consola } from 'consola';
import { fetchIncidents, formatIncidentForDisplay, handleError } from '../lib/utils.js';
import { MESSAGES } from '../lib/messages.js';
import type { Incident } from '../lib/types.js';

// ビジネスロジック: インシデント取得と処理
async function getIncidentsData(limit: number) {
    const allIncidents = await fetchIncidents();
    return allIncidents.slice(0, limit);
}

// UI表示ロジック: インシデント一覧の表示
function displayIncidents(incidents: Incident[], _originalLimit: number) {
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

export const incidentCommand = define({
    name: 'incident',
    description: 'Show occured incidents',
    args: {
        limit: {
            type: 'number',
            short: 'l',
            description: 'Number of incidents to show (default: 3)',
            default: 3,
        },
    },
    toKebab: true,
    async run(ctx) {
        const { limit } = ctx.values;

        try {
            consola.log(`${MESSAGES.INCIDENT.FETCHING}\n`);
            
            const incidents = await getIncidentsData(limit);
            displayIncidents(incidents, limit);

        } catch (error) {
            handleError(error, MESSAGES.INCIDENT.FETCH_ERROR);
            process.exit(1);
        }
    }
});


