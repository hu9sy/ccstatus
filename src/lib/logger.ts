export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerOptions {
  level?: LogLevel;
  enableDebug?: boolean;
  format?: 'json' | 'text';
}

export class Logger {
  private level: LogLevel;
  private enableDebug: boolean;
  private format: 'json' | 'text';

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? LogLevel.INFO;
    this.enableDebug = options.enableDebug ?? false;
    this.format = options.format ?? 'text';
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext): void {
    if (this.enableDebug) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (level > this.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.output(entry);
  }

  private output(entry: LogEntry): void {
    const output = this.format === 'json' 
      ? JSON.stringify(entry) 
      : this.formatText(entry);

    if (entry.level === LogLevel.ERROR) {
      console.error(output);
    } else if (entry.level === LogLevel.WARN) {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  private formatText(entry: LogEntry): string {
    const levelName = LogLevel[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleString('ja-JP');
    
    let output = `[${timestamp}] ${levelName}: ${entry.message}`;
    
    if (entry.context) {
      output += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    if (entry.error) {
      output += `\nError: ${entry.error.name} - ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\nStack: ${entry.error.stack}`;
      }
    }
    
    return output;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setDebug(enabled: boolean): void {
    this.enableDebug = enabled;
  }
}

// Default logger instance
export const logger = new Logger({
  level: LogLevel.INFO,
  enableDebug: process.env.NODE_ENV === 'development',
  format: 'text',
});