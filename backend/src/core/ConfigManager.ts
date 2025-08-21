/**
 * Configuration Manager - Centralized config with validation
 * Enterprise-grade configuration management with type safety
 */

import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/Logger';
import path from 'path';
import fs from 'fs';

// Configuration schema with validation
const ConfigSchema = z.object({
  // Server
  PORT: z.coerce.number().min(1000).max(65535).default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Security
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_ROUNDS: z.coerce.number().min(10).max(15).default(12),
  
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // File Upload
  MAX_FILE_SIZE: z.string().default('10MB'),
  UPLOAD_PATH: z.string().default('./uploads'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),
  
  // Optional Services
  REDIS_URL: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export class ConfigManager {
  private config: AppConfig | null = null;
  private isLoaded = false;

  constructor() {
    this.loadEnvironment();
  }

  /**
   * Load environment variables from .env file
   */
  private loadEnvironment(): void {
    try {
      // Load .env file
      const envPath = path.resolve(process.cwd(), '.env');
      
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        logger.debug('📄 Environment file loaded from .env');
      } else {
        logger.warn('⚠️ No .env file found, using environment variables');
      }

      // Also try to load from parent directory (for monorepo setup)
      const parentEnvPath = path.resolve(process.cwd(), '../.env');
      if (fs.existsSync(parentEnvPath)) {
        dotenv.config({ path: parentEnvPath });
        logger.debug('📄 Parent environment file loaded');
      }

    } catch (error) {
      logger.error('❌ Failed to load environment:', error);
      throw new Error('Environment loading failed');
    }
  }

  /**
   * Validate configuration against schema
   */
  public async validate(): Promise<void> {
    try {
      logger.info('🔍 Validating configuration...');

      // Parse and validate environment variables
      const result = ConfigSchema.safeParse(process.env);

      if (!result.success) {
        const errors = result.error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        
        logger.error('❌ Configuration validation failed:', errors);
        throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
      }

      this.config = result.data;
      this.isLoaded = true;

      // Create required directories
      this.createRequiredDirectories();

      logger.info('✅ Configuration validated successfully');
      logger.debug('📋 Configuration:', this.getSafeConfig());

    } catch (error) {
      logger.error('❌ Configuration validation error:', error);
      throw error;
    }
  }

  /**
   * Get configuration value by key
   */
  public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    if (!this.isLoaded || !this.config) {
      throw new Error('Configuration not loaded. Call validate() first.');
    }
    return this.config[key];
  }

  /**
   * Get all configuration (safe version without secrets)
   */
  public getSafeConfig(): Partial<AppConfig> {
    if (!this.config) return {};

    const { 
      JWT_SECRET, 
      REFRESH_TOKEN_SECRET, 
      SENDGRID_API_KEY, 
      TWILIO_AUTH_TOKEN,
      DATABASE_URL,
      ...safeConfig 
    } = this.config;

    return {
      ...safeConfig,
      DATABASE_URL: this.maskUrl(DATABASE_URL),
    };
  }

  /**
   * Check if running in production
   */
  public isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if running in development
   */
  public isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Check if running in test mode
   */
  public isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  /**
   * Create required directories
   */
  private createRequiredDirectories(): void {
    if (!this.config) return;

    const directories = [
      this.config.UPLOAD_PATH,
      path.dirname(this.config.LOG_FILE),
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        logger.debug(`📁 Created directory: ${dir}`);
      }
    });
  }

  /**
   * Mask sensitive URLs for logging
   */
  private maskUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      if (urlObj.password) {
        urlObj.password = '***';
      }
      return urlObj.toString();
    } catch {
      return '***';
    }
  }
}