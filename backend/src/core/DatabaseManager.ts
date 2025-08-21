/**
 * Database Manager - Enterprise database connection management
 * Handles connection lifecycle, health checks, and error recovery
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/Logger';

export class DatabaseManager {
  private prisma: PrismaClient | null = null;
  private isConnected = false;
  private connectionRetries = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 5000; // 5 seconds

  /**
   * Connect to database with retry logic
   */
  public async connect(): Promise<void> {
    try {
      logger.info('🔌 Connecting to database...');

      // Create Prisma client with proper configuration
      this.prisma = new PrismaClient({
        log: this.getLogConfig(),
        errorFormat: 'pretty',
      });

      // Setup event listeners
      this.setupEventListeners();

      // Test connection
      await this.testConnection();

      this.isConnected = true;
      this.connectionRetries = 0;
      
      logger.info('✅ Database connected successfully');

    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        logger.info(`🔄 Retrying connection (${this.connectionRetries}/${this.maxRetries}) in ${this.retryDelay}ms...`);
        
        await this.delay(this.retryDelay);
        return this.connect();
      }

      throw new Error(`Database connection failed after ${this.maxRetries} attempts`);
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.prisma) {
        await this.prisma.$disconnect();
        this.prisma = null;
        this.isConnected = false;
        logger.info('🔌 Database disconnected');
      }
    } catch (error) {
      logger.error('❌ Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Get Prisma client instance
   */
  public getClient(): PrismaClient {
    if (!this.prisma || !this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.prisma;
  }

  /**
   * Check database health
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      if (!this.prisma) {
        return {
          status: 'unhealthy',
          latency: 0,
          error: 'Database client not initialized',
        };
      }

      // Simple query to test connection
      await this.prisma.$queryRaw`SELECT 1 as health_check`;
      
      const latency = Date.now() - startTime;
      
      return {
        status: 'healthy',
        latency,
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      
      logger.error('❌ Database health check failed:', error);
      
      return {
        status: 'unhealthy',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute database transaction
   */
  public async transaction<T>(
    callback: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    if (!this.prisma) {
      throw new Error('Database not connected');
    }

    try {
      return await this.prisma.$transaction(callback);
    } catch (error) {
      logger.error('❌ Database transaction failed:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.prisma) {
      throw new Error('Prisma client not initialized');
    }

    try {
      await this.prisma.$connect();
      
      // Test with a simple query
      await this.prisma.$queryRaw`SELECT 1`;
      
      logger.debug('🔍 Database connection test passed');
    } catch (error) {
      logger.error('❌ Database connection test failed:', error);
      throw error;
    }
  }

  /**
   * Setup Prisma event listeners
   */
  private setupEventListeners(): void {
    if (!this.prisma) return;

    // Query logging in development
    if (process.env.NODE_ENV === 'development') {
      this.prisma.$on('query', (e) => {
        logger.debug('🔍 Database Query:', {
          query: e.query,
          params: e.params,
          duration: `${e.duration}ms`,
          timestamp: e.timestamp,
        });
      });
    }

    // Error logging
    this.prisma.$on('error', (e) => {
      logger.error('❌ Database Error:', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });

    // Info logging
    this.prisma.$on('info', (e) => {
      logger.info('ℹ️ Database Info:', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });

    // Warning logging
    this.prisma.$on('warn', (e) => {
      logger.warn('⚠️ Database Warning:', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });
  }

  /**
   * Get log configuration based on environment
   */
  private getLogConfig() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return isDevelopment
      ? [
          { level: 'query' as const, emit: 'event' as const },
          { level: 'error' as const, emit: 'event' as const },
          { level: 'info' as const, emit: 'event' as const },
          { level: 'warn' as const, emit: 'event' as const },
        ]
      : [
          { level: 'error' as const, emit: 'event' as const },
          { level: 'warn' as const, emit: 'event' as const },
        ];
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if database is connected
   */
  public isConnectedToDatabase(): boolean {
    return this.isConnected;
  }
}