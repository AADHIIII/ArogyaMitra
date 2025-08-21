/**
 * Application Core - Main application orchestrator
 * Follows enterprise patterns with proper lifecycle management
 */

import express, { Application as ExpressApp } from 'express';
import { Server } from 'http';
import { logger } from '../utils/Logger';
import { DatabaseManager } from './DatabaseManager';
import { MiddlewareManager } from './MiddlewareManager';
import { RouteManager } from './RouteManager';
import { ErrorManager } from './ErrorManager';
import { ConfigManager } from './ConfigManager';

export class Application {
  private app: ExpressApp;
  private server: Server | null = null;
  private databaseManager: DatabaseManager;
  private middlewareManager: MiddlewareManager;
  private routeManager: RouteManager;
  private errorManager: ErrorManager;
  private configManager: ConfigManager;

  constructor() {
    this.app = express();
    this.configManager = new ConfigManager();
    this.databaseManager = new DatabaseManager();
    this.middlewareManager = new MiddlewareManager(this.app);
    this.routeManager = new RouteManager(this.app);
    this.errorManager = new ErrorManager(this.app);
  }

  /**
   * Initialize application with proper startup sequence
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing ArogyaMitra Application...');

      // 1. Validate configuration
      await this.configManager.validate();
      logger.info('✅ Configuration validated');

      // 2. Connect to database
      await this.databaseManager.connect();
      logger.info('✅ Database connected');

      // 3. Setup middleware
      await this.middlewareManager.setup();
      logger.info('✅ Middleware configured');

      // 4. Setup routes
      await this.routeManager.setup();
      logger.info('✅ Routes configured');

      // 5. Setup error handling
      await this.errorManager.setup();
      logger.info('✅ Error handling configured');

      logger.info('🎉 Application initialized successfully');
    } catch (error) {
      logger.error('❌ Application initialization failed:', error);
      throw error;
    }
  }

  /**
   * Start the HTTP server
   */
  public async start(): Promise<void> {
    try {
      const port = this.configManager.get('PORT');
      
      this.server = this.app.listen(port, () => {
        logger.info(`🌟 ArogyaMitra API Server running on port ${port}`);
        logger.info(`📊 Environment: ${this.configManager.get('NODE_ENV')}`);
        logger.info(`🔗 Health Check: http://localhost:${port}/health`);
        logger.info(`📚 API Documentation: http://localhost:${port}/api/docs`);
      });

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown handling
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`📡 Received ${signal}. Starting graceful shutdown...`);

      if (this.server) {
        this.server.close(async () => {
          logger.info('🔌 HTTP server closed');

          try {
            await this.databaseManager.disconnect();
            logger.info('🗄️ Database disconnected');
            
            logger.info('✅ Graceful shutdown completed');
            process.exit(0);
          } catch (error) {
            logger.error('❌ Error during shutdown:', error);
            process.exit(1);
          }
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
          logger.error('⏰ Forced shutdown - connections did not close in time');
          process.exit(1);
        }, 10000);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }

  /**
   * Get Express app instance
   */
  public getApp(): ExpressApp {
    return this.app;
  }
}