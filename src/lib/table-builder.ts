import Table from 'cli-table3';

export interface TableConfig {
  headers: string[];
  colWidths?: number[];
  style?: {
    head?: string[];
    border?: string[];
  };
  wordWrap?: boolean;
}

export class TableBuilder {
  private table: Table;

  constructor(config: TableConfig) {
    this.table = new Table({
      head: config.headers,
      colWidths: config.colWidths,
      style: {
        head: config.style?.head || ['cyan'],
        border: config.style?.border || ['grey']
      },
      wordWrap: config.wordWrap !== false,
    });
  }

  addRow(data: (string | number)[]): TableBuilder {
    this.table.push(data);
    return this;
  }

  addRows(rows: (string | number)[][]): TableBuilder {
    rows.forEach(row => this.addRow(row));
    return this;
  }

  toString(): string {
    return this.table.toString();
  }

  static createServiceTable(): TableBuilder {
    return new TableBuilder({
      headers: ['コンポーネント', 'ステータス', '更新日時', '備考'],
      colWidths: [30, 25, 30, 50],
      wordWrap: true
    });
  }
}