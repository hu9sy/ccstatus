import { define } from 'gunshi';
import { StatusService } from '../services/status-service.js';
import { IncidentPresenter } from '../presenters/incident-presenter.js';
import { ErrorHandler } from '../lib/error-handler.js';
import { MESSAGES } from '../lib/messages.js';
import { APP_CONSTANTS } from '../lib/constants.js';

export const incidentCommand = define({
    name: 'incident',
    description: 'Show occured incidents',
    args: {
        limit: {
            type: 'number',
            short: 'l',
            description: 'Number of incidents to show (default: 3)',
            default: APP_CONSTANTS.DEFAULT_INCIDENT_LIMIT,
        },
    },
    toKebab: true,
    async run(ctx) {
        const { limit } = ctx.values;
        const statusService = new StatusService();
        const presenter = new IncidentPresenter();

        try {
            presenter.displayFetchingMessage();
            
            const allIncidents = await statusService.getIncidents();
            const incidents = statusService.getIncidentsWithLimit(allIncidents, limit);
            presenter.displayIncidents(incidents, limit);

        } catch (error) {
            ErrorHandler.handleWithExit(error, MESSAGES.INCIDENT.FETCH_ERROR);
        }
    }
});


