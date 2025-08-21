/**
 * User Routes - Route definitions for user profile endpoints
 * Handles all user profile management HTTP routes
 */

import { Router } from 'express';
import {
  getUserProfile,
  getMyProfile,
  updateProfile,
  updateUserProfile,
  deleteAccount,
  getUserStats,
  searchUsers,
} from '../controllers/users';
import {
  authenticate,
  requireAdmin,
  requireSelfAccess,
} from '../middleware/auth';

const router = Router();

/**
 * Protected routes (authentication required)
 */

// Get current user's profile
router.get('/profile', authenticate, getMyProfile);

// Update current user's profile
router.put('/profile', authenticate, updateProfile);

// Delete current user's account
router.delete('/profile', authenticate, deleteAccount);

/**
 * Admin-only routes
 */

// Get user statistics
router.get('/stats', authenticate, requireAdmin, getUserStats);

// Search users
router.get('/search', authenticate, requireAdmin, searchUsers);

/**
 * User-specific routes with access control
 */

// Get specific user profile (self-access or admin)
router.get('/:userId', authenticate, requireSelfAccess('userId'), getUserProfile);

// Update specific user profile (admin only)
router.put('/:userId/profile', authenticate, requireAdmin, updateUserProfile);

export default router;