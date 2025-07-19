import { define } from 'gunshi';
import { StatusService } from '../services/status-service.js';
import { ServicePresenter } from '../presenters/service-presenter.js';
import { ErrorHandler } from '../lib/error-handler.js';
import { MESSAGES } from '../lib/messages.js';

export const serviceCommand = define({
    name: 'service',
    description: 'Show status of services',
    toKebab: true,
    async run(_) {
        const statusService = new StatusService();
        const presenter = new ServicePresenter();

        try {
            const data = await statusService.getServiceStatus();
            
            presenter.displayStatusSummary(data);
            presenter.displayComponents(data.components);
            presenter.displayAdditionalInfo(data);

        } catch (error) {
            ErrorHandler.handle(error, MESSAGES.SERVICE.FETCH_ERROR);
        }
    }
});
