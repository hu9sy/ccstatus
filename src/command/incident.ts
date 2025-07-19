import { define } from 'gunshi';

// API型定義
interface IncidentComponent {
    id: string;
    name: string;
    status: string;
}

interface IncidentUpdate {
    id: string;
    status: string;
    body: string;
    created_at: string;
    display_at: string;
    affected_components: IncidentComponent[];
}

interface Incident {
    id: string;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    monitoring_at: string | null;
    resolved_at: string | null;
    impact: string;
    shortlink: string;
    started_at: string;
    page_id: string;
    incident_updates: IncidentUpdate[];
    components: IncidentComponent[];
}

interface IncidentsResponse {
    page: {
        id: string;
        name: string;
        url: string;
        time_zone: string;
        updated_at: string;
    };
    incidents: Incident[];
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
            console.log('📋 Anthropic Status API からインシデント情報を取得中...\n');

            const response = await fetch('https://status.anthropic.com/api/v2/incidents.json');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: IncidentsResponse = await response.json();
            const incidents = data.incidents.slice(0, limit);

            if (incidents.length === 0) {
                console.log('✅ インシデントは見つかりませんでした。すべてのサービスが正常に稼働しています。');
                return;
            }

            console.log(`📊 最新のインシデント ${incidents.length} 件を表示:\n`);

            incidents.forEach((incident, index) => {
                const statusIcon = getStatusIcon(incident.status);
                const impactIcon = getImpactIcon(incident.impact);
                const createdDate = new Date(incident.created_at).toLocaleString('ja-JP');
                const resolvedDate = incident.resolved_at
                    ? new Date(incident.resolved_at).toLocaleString('ja-JP')
                    : '未解決';

                console.log(`${index + 1}. ${statusIcon} ${incident.name}`);
                console.log(`   ステータス: ${getStatusText(incident.status)}`);
                console.log(`   影響度: ${impactIcon} ${incident.impact}`);
                console.log(`   発生日時: ${createdDate}`);
                console.log(`   解決日時: ${resolvedDate}`);

                if (incident.incident_updates.length > 0) {
                    const latestUpdate = incident.incident_updates[0];
                    if (latestUpdate) {
                        const updateDate = new Date(latestUpdate.created_at).toLocaleString('ja-JP');
                        console.log(`   最新更新: ${getStatusText(latestUpdate.status)} (${updateDate})`);
                    }
                }

                console.log(`   詳細: ${incident.shortlink}\n`);
            });

        } catch (error) {
            console.error('❌ インシデント情報の取得に失敗しました:');

            if (error instanceof Error) {
                console.error(`   ${error.message}`);
            } else {
                console.error('   不明なエラーが発生しました');
            }

            console.error('\n💡 インターネット接続を確認して、再度お試しください。');
            process.exit(1);
        }
    }
});

function getStatusIcon(status: string): string {
    switch (status) {
        case 'investigating':
            return '🔍';
        case 'identified':
            return '🔎';
        case 'monitoring':
            return '👀';
        case 'resolved':
            return '✅';
        case 'postmortem':
            return '📝';
        default:
            return '❓';
    }
}

function getImpactIcon(impact: string): string {
    switch (impact) {
        case 'none':
            return '🟢';
        case 'minor':
            return '🟡';
        case 'major':
            return '🟠';
        case 'critical':
            return '🔴';
        default:
            return '⚪';
    }
}

function getStatusText(status: string): string {
    switch (status) {
        case 'investigating':
            return '調査中';
        case 'identified':
            return '原因特定';
        case 'monitoring':
            return '監視中';
        case 'resolved':
            return '解決済み';
        case 'postmortem':
            return '事後分析';
        default:
            return status;
    }
}

