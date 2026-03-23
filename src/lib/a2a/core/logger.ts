/**
 * A2A Logger
 * Logging utilities for A2A services with Vercel integration
 */

import { getA2AConfig, getEnvironmentConfig } from './config';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string | number | null;
  method?: string;
  skill?: string;
  duration?: number;
  [key: string]: any;
}

class A2ALogger {
  private config = getA2AConfig();
  private env = getEnvironmentConfig();

  debug(message: string, context?: LogContext): void {
    if (this.config.debug) this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: any, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    this.log('error', message, errorContext);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp, level, message,
      service: 'frawdbot-a2a-agent',
      environment: this.env.isProduction ? 'production' : 'development',
      ...context,
    };

    if (this.env.isProduction) {
      console.log(JSON.stringify(logEntry));
    } else {
      const color = this.getColor(level);
      console.log(
        `${color}[${timestamp}] [${level.toUpperCase()}]\x1b[0m ${message}`,
        context || ''
      );
    }
  }

  private getColor(level: LogLevel): string {
    switch (level) {
      case 'debug': return '\x1b[36m';
      case 'info': return '\x1b[32m';
      case 'warn': return '\x1b[33m';
      case 'error': return '\x1b[31m';
      default: return '\x1b[0m';
    }
  }

  child(context: LogContext): BoundLogger {
    return new BoundLogger(this, context);
  }
}

class BoundLogger {
  constructor(private parent: A2ALogger, private boundContext: LogContext) {}

  debug(message: string, context?: LogContext): void {
    this.parent.debug(message, { ...this.boundContext, ...context });
  }

  info(message: string, context?: LogContext): void {
    this.parent.info(message, { ...this.boundContext, ...context });
  }

  warn(message: string, context?: LogContext): void {
    this.parent.warn(message, { ...this.boundContext, ...context });
  }

  error(message: string, error?: any, context?: LogContext): void {
    this.parent.error(message, error, { ...this.boundContext, ...context });
  }
}

export const logger = new A2ALogger();
