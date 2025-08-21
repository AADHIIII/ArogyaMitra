/**
 * Enterprise Logger - Production-ready logging with multiple transports
 * Structured logging with proper error handling and performance monitoring
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

class Logger {
  private logger: winston.Logger;
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    this.logger = this.createLogger();
  }

  /**
   * Create Winston logger with proper configuration
   */
  private createLogger(): winston.Logger {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

    return winston.createLogger({
      level: logLevel,
      levels,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss.SSS',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'arogyamitra-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: this.createTransports(isDevelopment),
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(this.logDir, 'exceptions.log'),
        }),
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(this.logDir, 'rejections.log'),
        }),
      ],
    });
  }

  /**
   * Create transport configurations
   */
  private createTransports(isDevelopment: boolean): winston.transport[] {
    const transports: winston.transport[] = [];

    // Console transport for development
    if (isDevelopment) {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ all: true }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
              const metaStr = Object.keys(meta).length ? 
                `\n${JSON.stringify(meta, null, 2)}` : '';
              return `${timestamp} [${level}]: ${message}${metaStr}`;
            })
          ),
        })
      );
    }

    // File transports
    transports.push(
      // All logs
      new winston.transports.File({
        filename: path.join(this.logDir, 'app.log'),
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true,
      }),

      // Error logs only
      new winston.transports.File({
        filename: path.join(this.logDir, 'error.log'),
        level: 'error',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true,
      }),

      // HTTP logs
      new winston.transports.File({
        filename: path.join(this.logDir, 'http.log'),
        level: 'http',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 3,
        tailable: true,
      })
    );

    return transports;
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log error with context
   */
  public error(message: string, error?: any, context?: Record<string, any>): void {
    this.logger.error(message, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      ...context,
    });
  }

  /**
   * Log warning
   */
  public warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(message, context);
  }

  /**
   * Log info
   */
  public info(message: string, context?: Record<string, any>): void {
    this.logger.info(message, context);
  }

  /**
   * Log HTTP requests
   */
  public http(message: string, context?: Record<string, any>): void {
    this.logger.http(message, context);
  }

  /**
   * Log debug information
   */
  public debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(message, context);
  }

  /**
   * Log with custom level
   */
  public log(level: string, message: string, context?: Record<string, any>): void {
    this.logger.log(level, message, context);
  }

  /**
   * Create child logger with additional context
   */
  public child(context: Record<string, any>): winston.Logger {
    return this.logger.child(context);
  }

  /**
   * Get stream for Morgan HTTP logging
   */
  public getHttpStream() {
    return {
      write: (message: string) => {
        this.http(message.trim());
      },
    };
  }

  /**
   * Performance timing utility
   */
  public time(label: string): void {
    console.time(label);
  }

  /**
   * End performance timing
   */
  public timeEnd(label: string): void {
    console.timeEnd(label);
  }

  /**
   * Log performance metrics
   */
  public performance(operation: string, duration: number, context?: Record<string, any>): void {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      operation,
      duration,
      ...context,
    });
  }

  /**
   * Log security events
   */
  public security(event: string, context?: Record<string, any>): void {
    this.warn(`Security Event: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }

  /**
   * Log audit events
   */
  public audit(action: string, userId?: string, context?: Record<string, any>): void {
    this.info(`Audit: ${action}`, {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for HTTP middleware
export const httpStream = logger.getHttpStream();