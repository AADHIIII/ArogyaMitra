import { Request, Response } from 'express';
import { MessagingService } from '../services/messaging';
import { AuthRequest } from '../middleware/auth';

export class MessageController {
  // Send a new message
  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const message = await MessagingService.sendMessage(userId, req.body);

      res.status(201).json({
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get conversations for current user
  static async getConversations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const conversations = await MessagingService.getConversations(userId);

      res.json({
        message: 'Conversations retrieved successfully',
        data: conversations,
      });
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get messages between current user and another user
  static async getMessages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters = {
        otherUserId: req.query.otherUserId as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await MessagingService.getMessages(userId, filters);

      res.json({
        message: 'Messages retrieved successfully',
        data: result.messages,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Get messages error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Mark messages as read
  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await MessagingService.markMessagesAsRead(userId, req.body);

      res.json({
        message: 'Messages marked as read',
        data: result,
      });
    } catch (error: any) {
      console.error('Mark as read error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get unread message count
  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await MessagingService.getUnreadCount(userId);

      res.json({
        message: 'Unread count retrieved successfully',
        data: result,
      });
    } catch (error: any) {
      console.error('Get unread count error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Search messages
  static async searchMessages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { query, otherUserId } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const messages = await MessagingService.searchMessages(
        userId,
        query,
        otherUserId as string
      );

      res.json({
        message: 'Messages searched successfully',
        data: messages,
      });
    } catch (error: any) {
      console.error('Search messages error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Delete message
  static async deleteMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { messageId } = req.params;

      const message = await MessagingService.deleteMessage(userId, messageId);

      res.json({
        message: 'Message deleted successfully',
        data: message,
      });
    } catch (error: any) {
      console.error('Delete message error:', error);
      if (error.message === 'Message not found') {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('You can only delete')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
}