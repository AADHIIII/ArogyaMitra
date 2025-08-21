/**
 * Middleware Manager - Centralized middleware configuration
 * Enterprise security and performance middleware setup
 */

import { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { ConfigManager } from './ConfigManager';
import { logger, httpStream } from '../utils/Logger';

export class MiddlewareManager {
  private app: Application;
  private configManager: ConfigManager;

  constructor(app: Application) {
    this.app = app;
    this.configManager = new ConfigManager();
  }

  /**
   * Setup all middleware in correct order
   */
  public async setup(): Promise<void> {
    try {
      logger.info('🔧 Setting up middleware...');

      // 1. Security middleware (first)
      this.setupSecurity();

      // 2. CORS configuration
      this.setupCors();

      // 3. Body parsing
      this.setupBodyParsing();

      // 4. Compression
      this.setupCompression();

      // 5. Rate limiting
      this.setupRateLimit();

      // 6. HTTP logging
      this.setupHttpLogging();

      // 7. Request context
      this.setupRequestContext();

      logger.info('✅ Middleware setup completed');
    } catch (error) {
      logger.error('❌ Middleware setup failed:', error);
      throw error;
    }
  }

  /**
   * Setup security middleware
   */
  private setupSecurity(): void {
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
        },
      },
      crossOriginEmbedderPolicy: false, // For development
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }));

    logger.debug('🛡️ Security headers configured');
  }

  /**
   * Setup CORS configuration
   */
  private setupCors(): void {
    const corsOrigin = this.configManager.get('CORS_ORIGIN');
    
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // In development, allow any localhost origin
        if (this.configManager.isDevelopment()) {
          if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
          }
        }

        // Check against configured origins
        const allowedOrigins = corsOrigin.split(',').map(o => o.trim());
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        logger.security('CORS violation attempt', { origin, allowedOrigins });
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Request-ID',
        'X-User-Agent',
      ],
      exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
      maxAge: 86400, // 24 hours
    }));

    logger.debug('🌐 CORS configured', { origin: corsOrigin });
  }

  /**
   * Setup body parsing middleware
   */
  private setupBodyParsing(): void {
    // JSON parsing with size limit
    this.app.use(express.json({
      limit: '10mb',
      verify: (req, res, buf) => {
        // Store raw body for webhook verification if needed
        (req as any).rawBody = buf;
      },
    }));

    // URL-encoded parsing
    this.app.use(express.urlencoded({
      extended: true,
      limit: '10mb',
    }));

    logger.debug('📝 Body parsing configured');
  }

  /**
   * Setup compression middleware
   */
  private setupCompression(): void {
    this.app.use(compression({
      filter: (req, res) => {
        // Don't compress if client doesn't support it
        if (req.headers['x-no-compression']) {
          return false;
        }
        // Use compression filter
        return compression.filter(req, res);
      },
      level: 6, // Good balance between compression and CPU usage
      threshold: 1024, // Only compress if response is larger than 1KB
    }));

    logger.debug('🗜️ Compression configured');
  }

  /**
   * Setup rate limiting
   */
  private setupRateLimit(): void {
    const windowMs = this.configManager.get('RATE_LIMIT_WINDOW_MS');
    const maxRequests = this.configManager.get('RATE_LIMIT_MAX_REQUESTS');

    // General rate limiter
    const generalLimiter = rateLimit({
      windowMs,
      max: maxRequests,
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000),
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        logger.security('Rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.url,
        });
        res.status(429).json({
          success: false,
          error: 'Too many requests from this IP, please try again later.',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      },
    });

    // Stricter rate limiter for auth endpoints
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      skipSuccessfulRequests: true,
      message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.',
      },
    });

    // Apply rate limiting
    this.app.use('/api/', generalLimiter);
    this.app.use('/api/auth/', authLimiter);

    logger.debug('🚦 Rate limiting configured', {
      windowMs,
      maxRequests,
      authLimit: 5,
    });
  }

  /**
   * Setup HTTP request logging
   */
  private setupHttpLogging(): void {
    // Custom Morgan format
    const morganFormat = this.configManager.isDevelopment()
      ? ':method :url :status :res[content-length] - :response-time ms'
      : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

    this.app.use(morgan(morganFormat, {
      stream: httpStream,
      skip: (req, res) => {
        // Skip health check logs in production
        if (!this.configManager.isDevelopment() && req.url === '/health') {
          return true;
        }
        return false;
      },
    }));

    logger.debug('📊 HTTP logging configured');
  }

  /**
   * Setup request context middleware
   */
  private setupRequestContext(): void {
    this.app.use((req, res, next) => {
      // Add request ID for tracing
      const requestId = req.headers['x-request-id'] as string || 
                       `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      req.headers['x-request-id'] = requestId;
      res.setHeader('X-Request-ID', requestId);

      // Add request start time for performance monitoring
      (req as any).startTime = Date.now();

      // Add user context (will be populated by auth middleware)
      (req as any).user = null;
      (req as any).userRole = null;

      next();
    });

    logger.debug('🏷️ Request context configured');
  }
}

// Import express properly
import express from 'express';