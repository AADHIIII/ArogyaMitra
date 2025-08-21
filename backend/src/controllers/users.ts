/**
 * Users Controller - HTTP request handlers for user profile operations
 * Handles user profile management, updates, and user-related operations
 */

import { Request, Response } from 'express';
import { AuthService } from '../services/auth';

/**
 * Get user profile by ID
 * GET /api/users/:userId
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
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
    console.error('Get user profile error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user profile',
    });
  }
};

/**
 * Get current user's profile
 * GET /api/users/profile
 */
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
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
      message: 'Profile retrieved successfully',
    });

  } catch (error) {
    console.error('Get my profile error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile',
    });
  }
};

/**
 * Update user profile
 * PUT /api/users/profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, phone, profileImage } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Validate input data
    const updateData: any = {};

    if (firstName !== undefined) {
      if (typeof firstName !== 'string' || firstName.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'First name must be a non-empty string',
        });
        return;
      }
      updateData.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (typeof lastName !== 'string' || lastName.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Last name must be a non-empty string',
        });
        return;
      }
      updateData.lastName = lastName.trim();
    }

    if (phone !== undefined) {
      if (phone !== null && phone !== '') {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(phone)) {
          res.status(400).json({
            success: false,
            error: 'Invalid phone number format',
          });
          return;
        }
        updateData.phone = phone;
      } else {
        updateData.phone = null;
      }
    }

    if (profileImage !== undefined) {
      if (profileImage !== null && profileImage !== '') {
        // Basic URL validation
        try {
          new URL(profileImage);
          updateData.profileImage = profileImage;
        } catch {
          res.status(400).json({
            success: false,
            error: 'Invalid profile image URL',
          });
          return;
        }
      } else {
        updateData.profileImage = null;
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: 'No valid fields provided for update',
      });
      return;
    }

    const updatedUser = await AuthService.updateUserProfile(userId, updateData);

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Profile update failed',
    });
  }
};

/**
 * Update specific user profile (Admin only)
 * PUT /api/users/:userId/profile
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, profileImage } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required',
      });
      return;
    }

    // Validate input data (same validation as updateProfile)
    const updateData: any = {};

    if (firstName !== undefined) {
      if (typeof firstName !== 'string' || firstName.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'First name must be a non-empty string',
        });
        return;
      }
      updateData.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (typeof lastName !== 'string' || lastName.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Last name must be a non-empty string',
        });
        return;
      }
      updateData.lastName = lastName.trim();
    }

    if (phone !== undefined) {
      if (phone !== null && phone !== '') {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(phone)) {
          res.status(400).json({
            success: false,
            error: 'Invalid phone number format',
          });
          return;
        }
        updateData.phone = phone;
      } else {
        updateData.phone = null;
      }
    }

    if (profileImage !== undefined) {
      if (profileImage !== null && profileImage !== '') {
        try {
          new URL(profileImage);
          updateData.profileImage = profileImage;
        } catch {
          res.status(400).json({
            success: false,
            error: 'Invalid profile image URL',
          });
          return;
        }
      } else {
        updateData.profileImage = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: 'No valid fields provided for update',
      });
      return;
    }

    const updatedUser = await AuthService.updateUserProfile(userId, updateData);

    res.status(200).json({
      success: true,
      data: { user: updatedUser },
      message: 'User profile updated successfully',
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'User profile update failed',
    });
  }
};

/**
 * Delete user account (soft delete by setting status to INACTIVE)
 * DELETE /api/users/profile
 */
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // In a real implementation, you might want to:
    // 1. Set user status to INACTIVE instead of deleting
    // 2. Cancel all future appointments
    // 3. Notify related users
    // 4. Archive user data according to data retention policies

    res.status(200).json({
      success: true,
      message: 'Account deletion requested. This feature is not fully implemented yet.',
    });

  } catch (error) {
    console.error('Delete account error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Account deletion failed',
    });
  }
};

/**
 * Get user statistics (for admin dashboard)
 * GET /api/users/stats
 */
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // This would typically fetch statistics from the database
    // For now, returning placeholder data
    
    const stats = {
      totalUsers: 0,
      activeUsers: 0,
      patientCount: 0,
      doctorCount: 0,
      adminCount: 0,
      newUsersThisMonth: 0,
      userGrowthRate: 0,
    };

    res.status(200).json({
      success: true,
      data: { stats },
      message: 'User statistics retrieved successfully',
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user statistics',
    });
  }
};

/**
 * Search users (Admin only)
 * GET /api/users/search
 */
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, role, status, page = 1, limit = 10 } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({
        success: false,
        error: 'Invalid page number',
      });
      return;
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        success: false,
        error: 'Invalid limit (must be between 1 and 100)',
      });
      return;
    }

    // This would typically search users in the database
    // For now, returning placeholder data
    
    const users: any[] = [];
    const total = 0;

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      message: 'User search completed',
    });

  } catch (error) {
    console.error('Search users error:', error);
    
    res.status(500).json({
      success: false,
      error: 'User search failed',
    });
  }
};