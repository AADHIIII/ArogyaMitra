/**
 * Route Manager - Centralized route configuration
 * Modular route setup with proper organization
 */

import { Application, Router } from 'express';
import { logger } from '../utils/Logger';
import { ResponseUtil } from '../utils/ResponseUtil';
import { DatabaseManager } from './DatabaseManager';

export class RouteManager {
  private app: Application;
  private databaseManager: DatabaseManager;

  constructor(app: Application) {
    this.app = app;
    this.databaseManager = new DatabaseManager();
  }

  /**
   * Setup all routes
   */
  public async setup(): Promise<void> {
    try {
      logger.info('🛣️ Setting up routes...');

      // Health check routes (outside /api prefix)
      this.setupHealthRoutes();

      // API routes
      this.setupApiRoutes();

      // Catch-all for unhandled routes
      this.setupCatchAll();

      logger.info('✅ Routes setup completed');
    } catch (error) {
      logger.error('❌ Route setup failed:', error);
      throw error;
    }
  }

  /**
   * Setup health check routes
   */
  private setupHealthRoutes(): void {
    // Basic health check
    this.app.get('/health', async (req, res) => {
      try {
        const health = await this.performHealthCheck();
        
        if (health.status === 'healthy') {
          ResponseUtil.success(res, health, 'Service is healthy');
        } else {
          ResponseUtil.error(res, 'Service is unhealthy', 503, health);
        }
      } catch (error) {
        logger.error('Health check failed:', error);
        ResponseUtil.internalError(res, 'Health check failed');
      }
    });

    // Detailed health check
    this.app.get('/health/detailed', async (req, res) => {
      try {
        const detailedHealth = await this.performDetailedHealthCheck();
        ResponseUtil.success(res, detailedHealth, 'Detailed health information');
      } catch (error) {
        logger.error('Detailed health check failed:', error);
        ResponseUtil.internalError(res, 'Detailed health check failed');
      }
    });

    logger.debug('🏥 Health routes configured');
  }

  /**
   * Setup API routes
   */
  private setupApiRoutes(): void {
    const apiRouter = Router();

    // API info endpoint
    apiRouter.get('/', (req, res) => {
      ResponseUtil.success(res, {
        name: 'ArogyaMitra API',
        description: 'Healthcare platform connecting patients with doctors',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/health',
          detailedHealth: '/health/detailed',
          docs: '/api/docs',
          auth: '/api/auth',
          users: '/api/users',
          doctors: '/api/doctors',
          appointments: '/api/appointments',
          prescriptions: '/api/prescriptions',
          messages: '/api/messages',
          notifications: '/api/notifications',
        },
      }, 'Welcome to ArogyaMitra API');
    });

    // Placeholder routes for future modules
    this.setupPlaceholderRoutes(apiRouter);

    // Mount API router
    this.app.use('/api', apiRouter);

    logger.debug('🔌 API routes configured');
  }

  /**
   * Setup placeholder routes for future implementation
   */
  private setupPlaceholderRoutes(router: Router): void {
    const placeholderRoutes = [
      { path: '/auth', description: 'Authentication endpoints' },
      { path: '/users', description: 'User management endpoints' },
      { path: '/doctors', description: 'Doctor management endpoints' },
      { path: '/appointments', description: 'Appointment booking endpoints' },
      { path: '/prescriptions', description: 'Prescription management endpoints' },
      { path: '/messages', description: 'Messaging endpoints' },
      { path: '/notifications', description: 'Notification endpoints' },
    ];

    placeholderRoutes.forEach(({ path, description }) => {
      router.all(path, (req, res) => {
        ResponseUtil.success(res, {
          message: `${description} - Coming soon in Task 2+`,
          method: req.method,
          path: req.path,
          timestamp: new Date().toISOString(),
        }, `${path.slice(1)} module not yet implemented`);
      });

      router.all(`${path}/*`, (req, res) => {
        ResponseUtil.success(res, {
          message: `${description} - Coming soon in Task 2+`,
          method: req.method,
          path: req.path,
          timestamp: new Date().toISOString(),
        }, `${path.slice(1)} module not yet implemented`);
      });
    });
  }

  /**
   * Setup catch-all route for unhandled requests
   */
  private setupCatchAll(): void {
    this.app.all('*', (req, res) => {
      logger.warn('Route not found', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });

      ResponseUtil.notFound(res, `Route ${req.method} ${req.url} not found`);
    });

    logger.debug('🚫 Catch-all route configured');
  }

  /**
   * Perform basic health check
   */
  private async performHealthCheck() {
    const startTime = Date.now();

    try {
      // Check database if connected
      let databaseStatus = 'not_connected';
      if (this.databaseManager.isConnectedToDatabase()) {
        const dbHealth = await this.databaseManager.healthCheck();
        databaseStatus = dbHealth.status;
      }

      const uptime = process.uptime();
      const memory = process.memoryUsage();

      return {
        status: databaseStatus === 'healthy' ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        services: {
          database: databaseStatus,
        },
        memory: {
          used: Math.round(memory.heapUsed / 1024 / 1024), // MB
          total: Math.round(memory.heapTotal / 1024 / 1024), // MB
        },
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error('Health check error:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Perform detailed health check
   */
  private async performDetailedHealthCheck() {
    const basicHealth = await this.performHealthCheck();

    return {
      ...basicHealth,
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      system: {
        loadAverage: process.loadavg(),
        cpuUsage: process.cpuUsage(),
      },
    };
  }
}