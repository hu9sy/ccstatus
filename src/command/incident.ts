import { define } from 'gunshi';
import type { IStatusService } from '../services/status-service.ts';
import { IncidentPresenter } from '../presenters/incident-presenter.ts';
import { BaseCommand } from '../lib/base-command.ts';
import { MESSAGES } from '../lib/messages.ts';
import { APP_CONSTANTS } from '../lib/constants.ts';
import { container, SERVICE_TOKENS } from '../lib/service-container.ts';

class IncidentCommandHandler extends BaseCommand {
    constructor(private statusService: IStatusService) {
        super();
    }

    async execute(limit: number) {
        const presenter = new IncidentPresenter();

        await this.executeWithErrorHandling(async () => {
            presenter.displayFetchingMessage();
            
            const allIncidents = await this.statusService.getIncidents();
            const incidents = this.statusService.getIncidentsWithLimit(allIncidents, limit);
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
        const statusService = container.resolve<IStatusService>(SERVICE_TOKENS.STATUS_SERVICE);
        const handler = new IncidentCommandHandler(statusService);
        await handler.execute(limit);
    }
});

