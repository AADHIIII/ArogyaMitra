import { prisma } from '../config/database';
import { logger } from './logger';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: 'connected' | 'disconnected' | 'error';
    redis?: 'connected' | 'disconnected' | 'error';
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

/**
 * Check database connectivity
 */
const checkDatabase = async (): Promise<'connected' | 'disconnected' | 'error'> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'connected';
  } catch (error) {
    logger.error('Database health check failed:', error);
    return 'error';
  }
};

/**
 * Check Redis connectivity (if configured)
 */
const checkRedis = async (): Promise<'connected' | 'disconnected' | 'error'> => {
  // TODO: Implement Redis health check when Redis is configured
  return 'disconnected';
};

/**
 * Get memory usage information
 */
const getMemoryUsage = () => {
  const memUsage = process.memoryUsage();
  const totalMemory = memUsage.heapTotal;
  const usedMemory = memUsage.heapUsed;
  
  return {
    used: Math.round(usedMemory / 1024 / 1024), // MB
    total: Math.round(totalMemory / 1024 / 1024), // MB
    percentage: Math.round((usedMemory / totalMemory) * 100),
  };
};

/**
 * Perform comprehensive health check
 */
export const performHealthCheck = async (): Promise<HealthStatus> => {
  const startTime = Date.now();
  
  try {
    // Check all services
    const [databaseStatus, redisStatus] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);

    const memory = getMemoryUsage();
    
    // Determine overall health status
    const isHealthy = databaseStatus === 'connected';
    
    const healthStatus: HealthStatus = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: databaseStatus,
        ...(process.env.REDIS_URL && { redis: redisStatus }),
      },
      memory,
    };

    const checkDuration = Date.now() - startTime;
    logger.debug(`Health check completed in ${checkDuration}ms`, healthStatus);

    return healthStatus;
  } catch (error) {
    logger.error('Health check failed:', error);
    
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'error',
      },
      memory: getMemoryUsage(),
    };
  }
};

/**
 * Detailed health check with additional metrics
 */
export const performDetailedHealthCheck = async () => {
  const basicHealth = await performHealthCheck();
  
  // Add more detailed metrics
  const detailed = {
    ...basicHealth,
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    performance: {
      eventLoopDelay: process.hrtime(),
      cpuUsage: process.cpuUsage(),
    },
  };

  return detailed;
};