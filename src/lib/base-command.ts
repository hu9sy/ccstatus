import { handleError } from './utils.js';

export abstract class BaseCommand {
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T | void> {
    try {
      return await operation();
    } catch (error) {
      handleError(error, errorMessage);
      process.exit(1);
    }
  }

  abstract execute(...args: unknown[]): Promise<void>;
}