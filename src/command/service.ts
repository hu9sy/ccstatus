import { define } from 'gunshi';
import { StatusService } from '../services/status-service.ts';
import { ServicePresenter } from '../presenters/service-presenter.ts';
import { BaseCommand } from '../lib/base-command.ts';
import { MESSAGES } from '../lib/messages.ts';

class ServiceCommandHandler extends BaseCommand {
    async execute() {
        const statusService = new StatusService();
        const presenter = new ServicePresenter();

        await this.executeWithErrorHandling(async () => {
            const data = await statusService.getServiceStatus();
            
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
        const handler = new ServiceCommandHandler();
        await handler.execute();
    }
});
