/**
 * Authentication Middleware - JWT token validation and user context
 * Protects routes and provides user information to request handlers
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { verifyAccessToken, extractTokenFromHeader, JWTPayload } from '../utils/jwt';
import { AuthService } from '../services/auth';

// Extend Express Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        firstName: string;
        lastName: string;
      };
      token?: string;
    }
  }
}

/**
 * Authentication middleware - Verifies JWT token and adds user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required',
        code: 'TOKEN_MISSING',
      });
      return;
    }

    // Verify token
    let decoded: JWTPayload;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid token',
        code: 'TOKEN_INVALID',
      });
      return;
    }

    // Get user details from database
    const user = await AuthService.getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      res.status(401).json({
        success: false,
        error: 'User account is not active',
        code: 'USER_INACTIVE',
      });
      return;
    }

    // Add user and token to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    req.token = token;

    next();

  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Optional authentication middleware - Adds user to request if token is valid, but doesn't require it
 */
export const optionalAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      // No token provided, continue without user context
      next();
      return;
    }

    try {
      const decoded = verifyAccessToken(token);
      const user = await AuthService.getUserById(decoded.userId);

      if (user && user.status === 'ACTIVE') {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        };
        req.token = token;
      }
    } catch (error) {
      // Invalid token, but we don't fail the request
      console.warn('Optional authentication failed:', error);
    }

    next();

  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    next(); // Continue even if there's an error
  }
};

/**
 * Role-based authorization middleware factory
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        details: {
          required: allowedRoles,
          current: req.user.role,
        },
      });
      return;
    }

    next();
  };
};

/**
 * Admin-only authorization middleware
 */
export const requireAdmin = authorize(UserRole.ADMIN);

/**
 * Doctor-only authorization middleware
 */
export const requireDoctor = authorize(UserRole.DOCTOR);

/**
 * Patient-only authorization middleware
 */
export const requirePatient = authorize(UserRole.PATIENT);

/**
 * Doctor or Admin authorization middleware
 */
export const requireDoctorOrAdmin = authorize(UserRole.DOCTOR, UserRole.ADMIN);

/**
 * Patient or Doctor authorization middleware
 */
export const requirePatientOrDoctor = authorize(UserRole.PATIENT, UserRole.DOCTOR);

/**
 * Self-access authorization - User can only access their own resources
 */
export const requireSelfAccess = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const targetUserId = req.params[userIdParam] || req.body[userIdParam];
    
    // Admin can access any user's resources
    if (req.user.role === UserRole.ADMIN) {
      next();
      return;
    }

    // User can only access their own resources
    if (req.user.id !== targetUserId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources.',
        code: 'SELF_ACCESS_REQUIRED',
      });
      return;
    }

    next();
  };
};

/**
 * Rate limiting for authentication endpoints
 */
export const authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();

    // Clean up expired entries
    for (const [key, value] of attempts.entries()) {
      if (now > value.resetTime) {
        attempts.delete(key);
      }
    }

    const clientAttempts = attempts.get(clientId);

    if (!clientAttempts) {
      // First attempt
      attempts.set(clientId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (now > clientAttempts.resetTime) {
      // Window expired, reset
      attempts.set(clientId, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (clientAttempts.count >= maxAttempts) {
      // Too many attempts
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((clientAttempts.resetTime - now) / 1000),
      });
      return;
    }

    // Increment attempts
    clientAttempts.count++;
    next();
  };
};