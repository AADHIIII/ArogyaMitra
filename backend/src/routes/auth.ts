/**
 * Authentication Routes - Route definitions for auth endpoints
 * Handles all authentication-related HTTP routes
 */

import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
  validatePassword,
} from '../controllers/auth';
import { authenticate, authRateLimit } from '../middleware/auth';

const router = Router();

// Apply rate limiting to auth routes
const authLimiter = authRateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

/**
 * Public routes (no authentication required)
 */

// User registration
router.post('/register', authLimiter, register);

// User login
router.post('/login', authLimiter, login);

// Refresh access token
router.post('/refresh', refreshToken);

// Password reset request
router.post('/forgot-password', authLimiter, forgotPassword);

// Password reset confirmation
router.post('/reset-password', authLimiter, resetPassword);

// Password strength validation
router.post('/validate-password', validatePassword);

/**
 * Protected routes (authentication required)
 */

// Get current user profile
router.get('/me', authenticate, getCurrentUser);

// User logout
router.post('/logout', authenticate, logout);

// Change password
router.put('/change-password', authenticate, changePassword);

export default router;