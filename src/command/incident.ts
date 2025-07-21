import { define } from 'gunshi';
import type { IStatusService } from '../services/status-service.ts';
import type { Incident } from '../lib/types.ts';
import { IncidentPresenter } from '../presenters/incident-presenter.ts';
import { BaseCommand } from '../lib/base-command.ts';
import { MESSAGES } from '../lib/messages.ts';
import { APP_CONSTANTS } from '../lib/constants.ts';
import { container, SERVICE_TOKENS } from '../lib/service-container.ts';

class IncidentCommandHandler extends BaseCommand {
    constructor(private statusService: IStatusService) {
        super();
    }

    /**
     * インシデント表示の最適化実行
     * Stream処理と並列化でパフォーマンスを向上させます
     */
    async execute(limit: number) {
        const presenter = new IncidentPresenter();

        await this.executeWithErrorHandling(async () => {
            // 取得メッセージの非同期表示とデータ取得を並列化
            await Promise.allSettled([
                this.displayFetchingAsync(presenter),
                this.checkStreamSupport()
            ]);

            // Stream処理とバッチ処理を状況に応じて選択
            const incidents = await this.getIncidentsOptimized(limit);
            
            // 結果表示を非同期で実行
            await this.displayIncidentsAsync(presenter, incidents, limit);
        }, MESSAGES.INCIDENT.FETCH_ERROR);
    }

    /**
     * Stream対応チェック
     */
    private async checkStreamSupport(): Promise<boolean> {
        return new Promise((resolve) => {
            globalThis.setTimeout(() => resolve(typeof this.statusService.getIncidentsStream === 'function'), 0);
        });
    }

    /**
     * 取得メッセージの非同期表示
     */
    private async displayFetchingAsync(presenter: IncidentPresenter): Promise<void> {
        return new Promise((resolve) => {
            globalThis.setTimeout(() => {
                presenter.displayFetchingMessage();
                resolve();
            }, 0);
        });
    }

    /**
     * 最適化されたインシデント取得
     * Stream処理が利用可能な場合は使用してメモリ効率化
     */
    private async getIncidentsOptimized(limit: number) {
        // Stream処理が利用可能かチェック
        if (typeof this.statusService.getIncidentsStream === 'function') {
            const incidents = [];
            
            // Stream処理で必要な分だけ取得（早期終了でAPI効率化）
            for await (const incident of this.statusService.getIncidentsStream(limit)) {
                incidents.push(incident);
                
                // バッチ処理：5件ごとに小休止（レスポンス性向上）
                if (incidents.length % 5 === 0) {
                    await new Promise(resolve => globalThis.setTimeout(resolve, 1));
                }
            }
            
            return incidents;
        } else {
            // 従来の方式（後方互換性）
            const allIncidents = await this.statusService.getIncidents();
            return this.statusService.getIncidentsWithLimit(allIncidents, limit);
        }
    }

    /**
     * インシデント表示の非同期化
     */
    private async displayIncidentsAsync(presenter: IncidentPresenter, incidents: Incident[], limit: number): Promise<void> {
        return new Promise((resolve) => {
            globalThis.setTimeout(() => {
                presenter.displayIncidents(incidents, limit);
                resolve();
            }, 0);
        });
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

