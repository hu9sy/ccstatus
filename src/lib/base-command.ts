import { ErrorHandler } from './error-handler.ts';

export abstract class BaseCommand {
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T | void> {
    try {
      return await operation();
    } catch (error) {
      ErrorHandler.handle(error, errorMessage);
      process.exit(1);
    }
  }

  abstract execute(...args: unknown[]): Promise<void>;
}