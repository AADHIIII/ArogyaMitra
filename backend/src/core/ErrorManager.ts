/**
 * Error Manager - Centralized error handling
 * Enterprise error handling with proper logging and user-friendly responses
 */

import { Application, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../utils/Logger';
import { ResponseUtil } from '../utils/ResponseUtil';

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ErrorManager {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  /**
   * Setup error handling middleware
   */
  public async setup(): Promise<void> {
    try {
      logger.info('🚨 Setting up error handling...');

      // Setup global error handler (must be last middleware)
      this.app.use(this.globalErrorHandler.bind(this));

      // Setup process error handlers
      this.setupProcessErrorHandlers();

      logger.info('✅ Error handling setup completed');
    } catch (error) {
      logger.error('❌ Error handling setup failed:', error);
      throw error;
    }
  }

  /**
   * Global error handling middleware
   */
  private globalErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    // Set default error properties
    let error = { ...err };
    error.statusCode = err.statusCode || 500;
    error.message = err.message || 'Internal Server Error';

    // Log error with context
    this.logError(err, req);

    // Handle specific error types
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      error = this.handlePrismaError(err);
    } else if (err instanceof ZodError) {
      error = this.handleValidationError(err);
    } else if (err.name === 'JsonWebTokenError') {
      error = this.handleJWTError();
    } else if (err.name === 'TokenExpiredError') {
      error = this.handleJWTExpiredError();
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      error = this.handleFileSizeError();
    } else if (err.type === 'entity.parse.failed') {
      error = this.handleJSONParseError();
    }

    // Send error response
    this.sendErrorResponse(error, res);
  }

  /**
   * Handle Prisma database errors
   */
  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = error.meta?.target as string[] || ['field'];
        return new AppError(
          `${field.join(', ')} already exists`,
          409,
          true,
          'DUPLICATE_FIELD'
        );

      case 'P2014':
        // Invalid ID
        return new AppError(
          'Invalid ID provided',
          400,
          true,
          'INVALID_ID'
        );

      case 'P2003':
        // Foreign key constraint violation
        return new AppError(
          'Invalid reference to related record',
          400,
          true,
          'INVALID_REFERENCE'
        );

      case 'P2025':
        // Record not found
        return new AppError(
          'Record not found',
          404,
          true,
          'RECORD_NOT_FOUND'
        );

      case 'P2021':
        // Table does not exist
        return new AppError(
          'Database table not found',
          500,
          false,
          'TABLE_NOT_FOUND'
        );

      default:
        logger.error('Unhandled Prisma error:', { code: error.code, meta: error.meta });
        return new AppError(
          'Database operation failed',
          500,
          false,
          'DATABASE_ERROR'
        );
    }
  }

  /**
   * Handle Zod validation errors
   */
  private handleValidationError(error: ZodError): AppError {
    const errors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    logger.debug('Validation error details:', errors);

    return new AppError(
      'Validation failed',
      422,
      true,
      'VALIDATION_ERROR'
    );
  }

  /**
   * Handle JWT errors
   */
  private handleJWTError(): AppError {
    return new AppError(
      'Invalid authentication token',
      401,
      true,
      'INVALID_TOKEN'
    );
  }

  /**
   * Handle JWT expired errors
   */
  private handleJWTExpiredError(): AppError {
    return new AppError(
      'Authentication token has expired',
      401,
      true,
      'TOKEN_EXPIRED'
    );
  }

  /**
   * Handle file size errors
   */
  private handleFileSizeError(): AppError {
    return new AppError(
      'File size exceeds maximum allowed limit',
      413,
      true,
      'FILE_TOO_LARGE'
    );
  }

  /**
   * Handle JSON parse errors
   */
  private handleJSONParseError(): AppError {
    return new AppError(
      'Invalid JSON format in request body',
      400,
      true,
      'INVALID_JSON'
    );
  }

  /**
   * Log error with context
   */
  private logError(error: any, req: Request): void {
    const errorContext = {
      requestId: req.headers['x-request-id'],
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      body: req.method !== 'GET' ? req.body : undefined,
      query: req.query,
      params: req.params,
    };

    if (error.statusCode >= 500) {
      logger.error('Server Error:', error, errorContext);
    } else if (error.statusCode >= 400) {
      logger.warn('Client Error:', error.message, errorContext);
    } else {
      logger.info('Error handled:', error.message, errorContext);
    }
  }

  /**
   * Send error response to client
   */
  private sendErrorResponse(error: AppError, res: Response): void {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Operational errors: send message to client
    if (error.isOperational) {
      const response: any = {
        success: false,
        error: error.message,
        code: error.code,
      };

      // Include stack trace in development
      if (isDevelopment) {
        response.stack = error.stack;
      }

      res.status(error.statusCode).json(response);
    } else {
      // Programming errors: don't leak error details
      logger.error('Programming Error:', error);

      const response: any = {
        success: false,
        error: 'Something went wrong!',
        code: 'INTERNAL_ERROR',
      };

      // Include error details in development
      if (isDevelopment) {
        response.details = {
          message: error.message,
          stack: error.stack,
        };
      }

      res.status(500).json(response);
    }
  }

  /**
   * Setup process-level error handlers
   */
  private setupProcessErrorHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (err: Error) => {
      logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
        reason,
        promise,
      });
      process.exit(1);
    });

    // Handle SIGTERM gracefully
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM received. Shutting down gracefully...');
      process.exit(0);
    });

    logger.debug('🔧 Process error handlers configured');
  }
}

/**
 * Async error wrapper utility
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};