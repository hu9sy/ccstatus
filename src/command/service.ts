import { define } from 'gunshi';
import { consola } from 'consola';
import Table from 'cli-table3';

interface Component {
    id: string;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    position: number;
    description: string | null;
    showcase: boolean;
    start_date: string | null;
    group_id: string | null;
    page_id: string;
    group: boolean;
    only_show_if_degraded: boolean;
}

interface StatusSummary {
    page: {
        id: string;
        name: string;
        url: string;
        time_zone: string;
        updated_at: string;
    };
    components: Component[];
    incidents: any[];
    scheduled_maintenances: any[];
    status: {
        indicator: string;
        description: string;
    };
}

export const serviceCommand = define({
    name: 'service',
    description: 'Show status of services',
    toKebab: true,
    async run(_) {
        try {
            const response = await fetch('https://status.anthropic.com/api/v2/summary.json');
            if (!response.ok) {
                console.error(`Failed to fetch status: ${response.status} ${response.statusText}`);
                return;
            }

            const data: StatusSummary = await response.json();

            // 全体サマリーを表示（英語表記）
            const statusMessage = `Status: ${data.status.description}`;
            const updateDate = new Date(data.page.updated_at);
            const jstTime = updateDate.toLocaleString('ja-JP');
            const utcTime = updateDate.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
            const updateMessage = `Updated: ${jstTime} (${utcTime})`;

            consola.box({
                title: 'Claude Service Status',
                message: `${statusMessage}\n${updateMessage}`,
                style: {
                    borderColor: 'blue',
                    borderStyle: 'round'
                }
            });

            // コンポーネントをテーブル形式で表示
            if (data.components.length > 0) {
                const table = new Table({
                    head: ['コンポーネント', 'ステータス', '更新日時', '備考'],
                    style: {
                        head: ['cyan'],
                    },
                    colWidths: [30, 25, 30, 50],
                    wordWrap: true,
                });

                data.components.forEach(component => {
                    const componentUpdateDate = new Date(component.updated_at);
                    const jstTime = componentUpdateDate.toLocaleString('ja-JP');
                    const utcTime = componentUpdateDate.toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
                    const updateTimeDisplay = `${jstTime}\n(${utcTime})`;

                    table.push([
                        component.name,
                        component.status,
                        updateTimeDisplay,
                        component.description || ''
                    ]);
                });

                consola.log('\nサービスコンポーネント:');
                console.log(table.toString());
            }

            // インシデント情報を表示
            if (data.incidents.length > 0) {
                consola.warn('\nアクティブなインシデント:');
                data.incidents.forEach(incident => {
                    consola.log(`  • ${incident.name}: ${incident.status}`);
                });
            }

            // メンテナンス情報を表示
            if (data.scheduled_maintenances.length > 0) {
                consola.info('\n予定されたメンテナンス:');
                data.scheduled_maintenances.forEach(maintenance => {
                    consola.log(`  • ${maintenance.name}: ${maintenance.status}`);
                });
            }

        } catch (error) {
            consola.error('Error fetching service status:', error);
        }
    }
});
