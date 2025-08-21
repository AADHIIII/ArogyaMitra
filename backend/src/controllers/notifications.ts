import { Request, Response } from 'express';
import { NotificationService } from '../services/notification';
import { AuthRequest } from '../middleware/auth';

export class NotificationController {
  // Create a new notification (admin only)
  static async createNotification(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can create notifications' });
      }

      const notification = await NotificationService.createNotification(req.body);

      res.status(201).json({
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error: any) {
      console.error('Create notification error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get notifications for current user
  static async getMyNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters = {
        type: req.query.type as any,
        status: req.query.status as any,
        unreadOnly: req.query.unreadOnly === 'true',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await NotificationService.getNotifications(userId, filters);

      res.json({
        message: 'Notifications retrieved successfully',
        data: result.notifications,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Mark notification as read
  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { notificationId } = req.params;

      const notification = await NotificationService.markAsRead(userId, notificationId);

      res.json({
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error: any) {
      console.error('Mark notification as read error:', error);
      if (error.message === 'Notification not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Access denied') {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await NotificationService.markAllAsRead(userId);

      res.json({
        message: 'All notifications marked as read',
        data: result,
      });
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get unread notification count
  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await NotificationService.getUnreadCount(userId);

      res.json({
        message: 'Unread count retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Get unread count error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Delete notification
  static async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { notificationId } = req.params;

      const result = await NotificationService.deleteNotification(userId, notificationId);

      res.json({
        message: 'Notification deleted successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Delete notification error:', error);
      if (error.message === 'Notification not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message === 'Access denied') {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Send notification manually (admin only)
  static async sendNotification(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can send notifications manually' });
      }

      const { notificationId } = req.params;

      const result = await NotificationService.sendNotification(notificationId);

      res.json({
        message: 'Notification sent successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Send notification error:', error);
      if (error.message === 'Notification not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  // Process scheduled notifications (admin only - for manual trigger)
  static async processScheduled(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can process scheduled notifications' });
      }

      const results = await NotificationService.processScheduledNotifications();

      res.json({
        message: 'Scheduled notifications processed',
        data: {
          processed: results.length,
          results,
        },
      });
    } catch (error: any) {
      console.error('Process scheduled notifications error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}