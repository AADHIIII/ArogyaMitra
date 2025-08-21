/**
 * Authentication Controller - HTTP request handlers for auth operations
 * Handles registration, login, logout, token refresh, and password operations
 */

import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { AuthService } from '../services/auth';
import { validatePasswordStrength } from '../utils/password';

/**
 * User registration
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !role) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          required: ['email', 'password', 'firstName', 'lastName', 'role'],
        },
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({
        success: false,
        error: 'Invalid role',
        details: {
          allowedRoles: Object.values(UserRole),
        },
      });
      return;
    }

    // Validate phone format if provided
    if (phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(phone)) {
        res.status(400).json({
          success: false,
          error: 'Invalid phone number format',
        });
        return;
      }
    }

    // Register user
    const result = await AuthService.registerUser({
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
    });

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
      message: 'User registered successfully',
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
};

/**
 * User login
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
      return;
    }

    // Login user
    const result = await AuthService.loginUser({ email, password });

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
      message: 'Login successful',
    });

  } catch (error) {
    console.error('Login error:', error);
    
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
      return;
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      data: { tokens },
      message: 'Token refreshed successfully',
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    res.status(401).json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
    });
  }
};

/**
 * User logout
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    await AuthService.logoutUser(userId);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });

  } catch (error) {
    console.error('Logout error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const user = await AuthService.getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
      message: 'User profile retrieved successfully',
    });

  } catch (error) {
    console.error('Get current user error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile',
    });
  }
};

/**
 * Change password
 * PUT /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Current password and new password are required',
      });
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        details: {
          errors: passwordValidation.errors,
          score: passwordValidation.score,
        },
      });
      return;
    }

    await AuthService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Change password error:', error);
    
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password change failed',
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }

    const resetToken = await AuthService.requestPasswordReset(email);

    // In production, you would send this token via email
    // For development, we'll return it in the response
    res.status(200).json({
      success: true,
      message: 'Password reset instructions have been sent to your email',
      ...(process.env.NODE_ENV === 'development' && { resetToken }),
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password reset request failed',
    });
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Reset token and new password are required',
      });
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        details: {
          errors: passwordValidation.errors,
          score: passwordValidation.score,
        },
      });
      return;
    }

    await AuthService.confirmPasswordReset(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Password reset failed',
    });
  }
};

/**
 * Validate password strength
 * POST /api/auth/validate-password
 */
export const validatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        error: 'Password is required',
      });
      return;
    }

    const validation = validatePasswordStrength(password);

    res.status(200).json({
      success: true,
      data: {
        isValid: validation.isValid,
        score: validation.score,
        errors: validation.errors,
        strength: getPasswordStrengthDescription(validation.score),
      },
      message: 'Password validation completed',
    });

  } catch (error) {
    console.error('Password validation error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Password validation failed',
    });
  }
};

/**
 * Helper function to get password strength description
 */
const getPasswordStrengthDescription = (score: number): string => {
  if (score < 30) return 'Very Weak';
  if (score < 50) return 'Weak';
  if (score < 70) return 'Fair';
  if (score < 85) return 'Good';
  return 'Strong';
};