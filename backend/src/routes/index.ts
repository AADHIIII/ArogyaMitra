import { Router } from 'express';
import { ResponseUtil } from '../utils/response';
import { performHealthCheck, performDetailedHealthCheck } from '../utils/healthCheck';
import { catchAsync } from '../middleware/errorHandler';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', catchAsync(async (req, res) => {
  const healthStatus = await performHealthCheck();
  
  if (healthStatus.status === 'healthy') {
    ResponseUtil.success(res, healthStatus, 'Server is healthy');
  } else {
    ResponseUtil.error(res, 'Server is unhealthy', 503, healthStatus);
  }
}));

/**
 * Detailed health check endpoint
 */
router.get('/health/detailed', catchAsync(async (req, res) => {
  const detailedHealth = await performDetailedHealthCheck();
  ResponseUtil.success(res, detailedHealth, 'Detailed health information');
}));

/**
 * API info endpoint
 */
router.get('/info', (req, res) => {
  ResponseUtil.success(res, {
    name: 'ArogyaMitra API',
    description: 'Healthcare platform API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    documentation: '/api/docs',
  }, 'API information');
});

/**
 * Root endpoint
 */
router.get('/', (req, res) => {
  ResponseUtil.success(res, {
    message: 'Welcome to ArogyaMitra API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      info: '/api/info',
      docs: '/api/docs',
    },
  }, 'ArogyaMitra API is running');
});

// Placeholder routes for future implementation
router.use('/auth', (req, res) => {
  ResponseUtil.success(res, null, 'Auth routes - Coming soon');
});

router.use('/users', (req, res) => {
  ResponseUtil.success(res, null, 'User routes - Coming soon');
});

router.use('/doctors', (req, res) => {
  ResponseUtil.success(res, null, 'Doctor routes - Coming soon');
});

router.use('/appointments', (req, res) => {
  ResponseUtil.success(res, null, 'Appointment routes - Coming soon');
});

router.use('/prescriptions', (req, res) => {
  ResponseUtil.success(res, null, 'Prescription routes - Coming soon');
});

router.use('/messages', (req, res) => {
  ResponseUtil.success(res, null, 'Message routes - Coming soon');
});

router.use('/notifications', (req, res) => {
  ResponseUtil.success(res, null, 'Notification routes - Coming soon');
});

export default router;