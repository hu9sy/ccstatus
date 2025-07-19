import { define } from 'gunshi';
import { consola } from 'consola';
import Table from 'cli-table3';
import { fetchServiceStatus, formatDateTime, formatDateTimeWithUTC, handleError } from '../lib/utils.js';
import { MESSAGES } from '../lib/messages.js';
import type { StatusSummary, Component } from '../lib/types.js';

// ビジネスロジック: サービスステータス取得
async function getServiceStatusData(): Promise<StatusSummary> {
    return await fetchServiceStatus();
}

// UI表示ロジック: ステータス概要の表示
function displayStatusSummary(data: StatusSummary) {
    const statusMessage = `Status: ${data.status.description}`;
    const updateMessage = `Updated: ${formatDateTime(data.page.updated_at)}`;

    consola.box({
        title: 'Claude Service Status',
        message: `${statusMessage}\n${updateMessage}`,
        style: {
            borderColor: 'blue',
            borderStyle: 'round'
        }
    });
}

// UI表示ロジック: コンポーネント一覧の表示
function displayComponents(components: Component[]) {
    if (components.length === 0) return;

    const table = new Table({
        head: [
            MESSAGES.SERVICE.TABLE_HEADERS.COMPONENT,
            MESSAGES.SERVICE.TABLE_HEADERS.STATUS,
            MESSAGES.SERVICE.TABLE_HEADERS.UPDATED_AT,
            MESSAGES.SERVICE.TABLE_HEADERS.DESCRIPTION
        ],
        style: {
            head: ['cyan'],
        },
        colWidths: [30, 25, 30, 50],
        wordWrap: true,
    });

    components.forEach(component => {
        const updateTimeDisplay = formatDateTimeWithUTC(component.updated_at);
        table.push([
            component.name,
            component.status,
            updateTimeDisplay,
            component.description || ''
        ]);
    });

    consola.log(`\n${MESSAGES.SERVICE.COMPONENTS_HEADER}`);
    console.log(table.toString());
}

// UI表示ロジック: インシデント・メンテナンス情報の表示
function displayAdditionalInfo(data: StatusSummary) {
    // インシデント情報を表示
    if (data.incidents.length > 0) {
        consola.warn(`\n${MESSAGES.SERVICE.ACTIVE_INCIDENTS}`);
        data.incidents.forEach(incident => {
            consola.log(`  • ${incident.name}: ${incident.status}`);
        });
    }

    // メンテナンス情報を表示
    if (data.scheduled_maintenances.length > 0) {
        consola.info(`\n${MESSAGES.SERVICE.SCHEDULED_MAINTENANCE}`);
        data.scheduled_maintenances.forEach(maintenance => {
            consola.log(`  • ${maintenance.name}: ${maintenance.status}`);
        });
    }
}

export const serviceCommand = define({
    name: 'service',
    description: 'Show status of services',
    toKebab: true,
    async run(_) {
        try {
            const data = await getServiceStatusData();
            
            displayStatusSummary(data);
            displayComponents(data.components);
            displayAdditionalInfo(data);

        } catch (error) {
            handleError(error, MESSAGES.SERVICE.FETCH_ERROR);
        }
    }
});
