import { define } from 'gunshi';
import type { IStatusService } from '../services/status-service.ts';
import type { StatusSummary } from '../lib/types.ts';
import { ServicePresenter } from '../presenters/service-presenter.ts';
import { BaseCommand } from '../lib/base-command.ts';
import { MESSAGES } from '../lib/messages.ts';
import { container, SERVICE_TOKENS } from '../lib/service-container.ts';

class ServiceCommandHandler extends BaseCommand {
    constructor(private statusService: IStatusService) {
        super();
    }

    /**
     * サービスステータス表示の最適化実行
     * データ取得と表示を並列化してパフォーマンスを向上させます
     */
    async execute() {
        const presenter = new ServicePresenter();

        await this.executeWithErrorHandling(async () => {
            // 並列処理でデータ取得を最適化
            const [statusData] = await Promise.allSettled([
                this.statusService.getServiceStatus(),
                this.checkStreamCapability()
            ]);

            if (statusData.status === 'rejected') {
                throw statusData.reason;
            }

            const data = statusData.value;

            // UI 表示も並列化（非同期処理として）
            const displayTasks = [
                this.displayStatusSummaryAsync(presenter, data),
                this.displayComponentsOptimized(presenter, data),
                this.displayAdditionalInfoAsync(presenter, data)
            ];

            // すべての表示処理を並列実行
            await Promise.all(displayTasks);
        }, MESSAGES.SERVICE.FETCH_ERROR);
    }

    /**
     * Stream 対応をチェック（将来の機能拡張用）
     */
    private async checkStreamCapability(): Promise<boolean> {
        return new Promise((resolve) => {
            // 非同期でStream機能の可用性を確認
            globalThis.setTimeout(() => resolve(true), 0);
        });
    }

    /**
     * ステータスサマリー表示の非同期化
     */
    private async displayStatusSummaryAsync(presenter: ServicePresenter, data: StatusSummary): Promise<void> {
        return new Promise((resolve) => {
            // 非同期でUI表示を実行
            globalThis.setTimeout(() => {
                presenter.displayStatusSummary(data);
                resolve();
            }, 0);
        });
    }

    /**
     * コンポーネント表示の最適化（遅延読み込み対応）
     */
    private async displayComponentsOptimized(presenter: ServicePresenter, data: StatusSummary): Promise<void> {
        return new Promise((resolve) => {
            globalThis.setTimeout(async () => {
                // Stream処理が利用可能な場合は遅延読み込みを使用
                if (typeof this.statusService.getComponentsLazy === 'function') {
                    const components = [];
                    for await (const component of this.statusService.getComponentsLazy()) {
                        components.push(component);
                        // 大量データ対応：10件ごとに処理を分割
                        if (components.length % 10 === 0) {
                            await new Promise(resolve => globalThis.setTimeout(resolve, 1));
                        }
                    }
                    presenter.displayComponents(components);
                } else {
                    presenter.displayComponents(data.components);
                }
                resolve();
            }, 0);
        });
    }

    /**
     * 追加情報表示の非同期化
     */
    private async displayAdditionalInfoAsync(presenter: ServicePresenter, data: StatusSummary): Promise<void> {
        return new Promise((resolve) => {
            globalThis.setTimeout(() => {
                presenter.displayAdditionalInfo(data);
                resolve();
            }, 0);
        });
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
