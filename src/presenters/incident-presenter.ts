import { consola } from 'consola';
import { formatIncidentForDisplay } from '../lib/utils.ts';
import { MESSAGES } from '../lib/messages.ts';
import type { Incident } from '../lib/types.ts';

/**
 * インシデント情報の表示を担当するプレゼンタークラス
 * CLI インターフェースでインシデント履歴を詳細に表示します
 * 
 * @example
 * ```typescript
 * const presenter = new IncidentPresenter();
 * const incidents = await statusService.getIncidents();
 * presenter.displayFetchingMessage();
 * presenter.displayIncidents(incidents, 5);
 * ```
 */
export class IncidentPresenter {
  /**
   * インシデント一覧を詳細情報とともに表示します
   * 各インシデントについてタイトル、ステータス、影響レベル、日時、最新更新を表示
   * @param incidents - 表示するインシデントの配列
   * @param _originalLimit - 元の制限数（使用されないパラメーター）
   */
  displayIncidents(incidents: Incident[], _originalLimit: number): void {
    if (incidents.length === 0) {
      consola.log(MESSAGES.INCIDENT.NO_INCIDENTS);
      return;
    }

    consola.log(`\n${MESSAGES.INCIDENT.DISPLAY_HEADER(incidents.length)}\n`);

    incidents.forEach((incident, index) => {
      const formatted = formatIncidentForDisplay(incident, index);
      
      consola.log(formatted.title);
      consola.log(`   ${formatted.status}`);
      consola.log(`   ${formatted.impact}`);
      consola.log(`   ${formatted.createdAt}`);
      consola.log(`   ${formatted.resolvedAt}`);
      
      if (formatted.latestUpdate) {
        consola.log(`   ${formatted.latestUpdate}`);
      }
      
      consola.log(`   ${formatted.detailsUrl}\n`);
    });
  }

  /**
   * データ取得中のメッセージを表示します
   * API 呼び出し前にユーザーに処理中であることを通知
   */
  displayFetchingMessage(): void {
    consola.log(`${MESSAGES.INCIDENT.FETCHING}\n`);
  }
}