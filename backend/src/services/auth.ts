/**
 * Authentication Service - Core authentication business logic
 * Handles user registration, login, token management, and password operations
 */

import { PrismaClient, User, UserRole, UserStatus } from '@prisma/client';
import { hashPassword, comparePassword, validatePasswordStrength, generatePasswordResetToken, verifyResetToken } from '../utils/password';
import { generateTokens, verifyRefreshToken, TokenResponse } from '../utils/jwt';

const prisma = new PrismaClient();

// Service interfaces
export interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: Omit<User, 'passwordHash'>;
  tokens: TokenResponse;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

/**
 * Authentication Service Class
 */
export class AuthService {
  /**
   * Register a new user
   */
  static async registerUser(userData: RegisterUserData): Promise<AuthResult> {
    const { email, password, firstName, lastName, phone, role } = userData;

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            ...(phone ? [{ phone }] : []),
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
          throw new Error('User with this email already exists');
        }
        if (existingUser.phone === phone) {
          throw new Error('User with this phone number already exists');
        }
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          firstName,
          lastName,
          phone,
          role,
          status: UserStatus.PENDING_VERIFICATION,
          passwordHash,
        },
      });

      // Generate tokens
      const tokens = generateTokens({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = newUser;

      return {
        user: userWithoutPassword,
        tokens,
      };

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('User registration failed');
    }
  }

  /**
   * Login user with email and password
   */
  static async loginUser(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password } = credentials;

    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (user.status === UserStatus.SUSPENDED) {
        throw new Error('Account has been suspended. Please contact support.');
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new Error('Account is inactive. Please contact support.');
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Update user status to active if pending verification
      if (user.status === UserStatus.PENDING_VERIFICATION) {
        await prisma.user.update({
          where: { id: user.id },
          data: { status: UserStatus.ACTIVE },
        });
      }

      // Return user without password hash
      const { passwordHash: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens,
      };

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new Error('User account is not active');
      }

      // Generate new tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<Omit<User, 'passwordHash'> | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return null;
      }

      const { passwordHash: _, ...userWithoutPassword } = user;
      return userWithoutPassword;

    } catch (error) {
      throw new Error('Failed to fetch user');
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(
    userId: string,
    updateData: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'profileImage'>>
  ): Promise<Omit<User, 'passwordHash'>> {
    try {
      // Check if phone number is already taken by another user
      if (updateData.phone) {
        const existingUser = await prisma.user.findFirst({
          where: {
            phone: updateData.phone,
            NOT: { id: userId },
          },
        });

        if (existingUser) {
          throw new Error('Phone number is already in use');
        }
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      const { passwordHash: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Profile update failed');
    }
  }

  /**
   * Change user password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Password change failed');
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<string> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Don't reveal if email exists or not for security
        throw new Error('If an account with this email exists, a password reset link has been sent.');
      }

      // Generate reset token
      const resetTokenData = generatePasswordResetToken();

      // Store reset token in database (you might want to create a separate table for this)
      // For now, we'll use a simple approach with user table
      // In production, consider creating a separate password_reset_tokens table

      // Return the token (in production, this would be sent via email)
      return resetTokenData.token;

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Password reset request failed');
    }
  }

  /**
   * Confirm password reset
   */
  static async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // In a real implementation, you would:
      // 1. Find the reset token in the database
      // 2. Verify it hasn't expired
      // 3. Get the associated user
      // 4. Update their password
      // 5. Delete the reset token

      // For now, this is a placeholder
      throw new Error('Password reset confirmation not fully implemented');

    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Password reset confirmation failed');
    }
  }

  /**
   * Logout user (in a real implementation, you might want to blacklist the token)
   */
  static async logoutUser(userId: string): Promise<void> {
    try {
      // In a stateless JWT implementation, logout is typically handled client-side
      // by removing the token from storage.
      // 
      // For enhanced security, you could:
      // 1. Maintain a blacklist of tokens
      // 2. Use shorter token expiration times
      // 3. Implement token versioning
      
      // For now, this is a placeholder that could log the logout event
      console.log(`User ${userId} logged out at ${new Date().toISOString()}`);

    } catch (error) {
      throw new Error('Logout failed');
    }
  }
}