import { Router } from 'express';
import { MessageController } from '../controllers/messages';
import { authenticate } from '../middleware/auth';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// Message routes
router.post('/', MessageController.sendMessage);
router.get('/conversations', MessageController.getConversations);
router.get('/search', MessageController.searchMessages);
router.get('/unread-count', MessageController.getUnreadCount);
router.get('/', MessageController.getMessages);
router.post('/mark-read', MessageController.markAsRead);
router.delete('/:messageId', MessageController.deleteMessage);

export default router;