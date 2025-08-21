import { Router } from 'express';
import { NotificationController } from '../controllers/notifications';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

// User notification routes
router.get('/my', NotificationController.getMyNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.post('/:notificationId/read', NotificationController.markAsRead);
router.post('/mark-all-read', NotificationController.markAllAsRead);
router.delete('/:notificationId', NotificationController.deleteNotification);

// Admin-only routes
router.post('/', authorize(UserRole.ADMIN), NotificationController.createNotification);
router.post('/:notificationId/send', authorize(UserRole.ADMIN), NotificationController.sendNotification);
router.post('/process-scheduled', authorize(UserRole.ADMIN), NotificationController.processScheduled);

export default router;