import { define } from 'gunshi';
import type { IStatusService } from '../services/status-service.ts';
import { ServicePresenter } from '../presenters/service-presenter.ts';
import { BaseCommand } from '../lib/base-command.ts';
import { MESSAGES } from '../lib/messages.ts';
import { container, SERVICE_TOKENS } from '../lib/service-container.ts';

class ServiceCommandHandler extends BaseCommand {
    constructor(private statusService: IStatusService) {
        super();
    }

    async execute() {
        const presenter = new ServicePresenter();

        await this.executeWithErrorHandling(async () => {
            const data = await this.statusService.getServiceStatus();

            presenter.displayStatusSummary(data);
            presenter.displayComponents(data.components);
            presenter.displayAdditionalInfo(data);
        }, MESSAGES.SERVICE.FETCH_ERROR);
    }
}

export const serviceCommand = define({
    name: 'service',
    description: 'Show status of services',
    toKebab: true,
    async run(_) {
        const statusService = container.resolve<IStatusService>(SERVICE_TOKENS.STATUS_SERVICE);
        const handler = new ServiceCommandHandler(statusService);
        await handler.execute();
    }
});
