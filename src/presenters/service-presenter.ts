import { consola } from 'consola';
import { coloredStatus, formatDateTime } from '../lib/utils.ts';
import { MESSAGES } from '../lib/messages.ts';
import { TableBuilder } from '../lib/table-builder.ts';
import { UI_CONSTANTS } from '../lib/constants.ts';
import type { StatusSummary, Component } from '../lib/types.ts';

export class ServicePresenter {
  displayStatusSummary(data: StatusSummary): void {
    const statusMessage = `Status: ${data.status.description}`;
    const updateMessage = `Updated: ${formatDateTime(data.page.updated_at)}`;

    consola.box({
      title: 'Claude Service Status',
      message: `${statusMessage}\n${updateMessage}`,
      style: {
        borderColor: UI_CONSTANTS.BOX_STYLE.BORDER_COLOR,
        borderStyle: UI_CONSTANTS.BOX_STYLE.BORDER_STYLE
      }
    });
  }

  displayComponents(components: Component[]): void {
    if (components.length === 0) return;

    const table = TableBuilder.createServiceTable();

    components.forEach(component => {
      const updateTimeDisplay = formatDateTime(component.updated_at, true);
      table.addRow([
        component.name,
        coloredStatus(component.status),
        updateTimeDisplay,
        component.description || ''
      ]);
    });

    consola.log(`\n${MESSAGES.SERVICE.COMPONENTS_HEADER}`);
    console.log(table.toString());
  }

  displayAdditionalInfo(data: StatusSummary): void {
    if (data.incidents.length > 0) {
      consola.warn(`\n${MESSAGES.SERVICE.ACTIVE_INCIDENTS}`);
      data.incidents.forEach(incident => {
        consola.log(`  • ${incident.name}: ${incident.status}`);
      });
    }

    if (data.scheduled_maintenances.length > 0) {
      consola.info(`\n${MESSAGES.SERVICE.SCHEDULED_MAINTENANCE}`);
      data.scheduled_maintenances.forEach(maintenance => {
        consola.log(`  • ${maintenance.name}: ${maintenance.status}`);
      });
    }
  }
}