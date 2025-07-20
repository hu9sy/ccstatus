import { define } from 'gunshi';
import { StatusService } from '../services/status-service.ts';
import { IncidentPresenter } from '../presenters/incident-presenter.ts';
import { BaseCommand } from '../lib/base-command.ts';
import { MESSAGES } from '../lib/messages.ts';
import { APP_CONSTANTS } from '../lib/constants.ts';

class IncidentCommandHandler extends BaseCommand {
    async execute(limit: number) {
        const statusService = new StatusService();
        const presenter = new IncidentPresenter();

        await this.executeWithErrorHandling(async () => {
            presenter.displayFetchingMessage();
            
            const allIncidents = await statusService.getIncidents();
            const incidents = statusService.getIncidentsWithLimit(allIncidents, limit);
            presenter.displayIncidents(incidents, limit);
        }, MESSAGES.INCIDENT.FETCH_ERROR);
    }
}

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
        const handler = new IncidentCommandHandler();
        await handler.execute(limit);
    }
});

