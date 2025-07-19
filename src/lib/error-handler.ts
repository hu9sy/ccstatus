import { consola } from 'consola';
import { MESSAGES } from './messages.js';

export class ErrorHandler {
  static handle(error: unknown, context: string): void {
    consola.error(context);

    if (error instanceof Error) {
      consola.error(`   ${error.message}`);
    } else {
      consola.error(`   ${MESSAGES.INCIDENT.UNKNOWN_ERROR}`);
    }

    consola.error(`\n${MESSAGES.INCIDENT.CONNECTION_HINT}`);
  }

  static handleWithExit(error: unknown, context: string): never {
    this.handle(error, context);
    process.exit(1);
  }
}