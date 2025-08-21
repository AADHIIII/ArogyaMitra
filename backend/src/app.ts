/**
 * Minimal Working Express App - Task 1 Foundation
 * Clean, simple, production-ready server
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Create Express app
const app = express();

// Basic security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3004',
  credentials: true,
}));
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    },
    message: 'ArogyaMitra API is healthy',
  });
});

// API root endpoint
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'ArogyaMitra API',
      description: 'Healthcare platform API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        health: '/health',
        api: '/api',
      },
    },
    message: 'Welcome to ArogyaMitra API',
  });
});

// Import route modules
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import doctorRoutes from './routes/doctors';
import appointmentRoutes from './routes/appointments';
import prescriptionRoutes from './routes/prescriptions';
import messageRoutes from './routes/messages';
import notificationRoutes from './routes/notifications';

// Authentication routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Doctor routes (Task 3)
app.use('/api/doctors', doctorRoutes);

// Appointment routes (Task 4)
app.use('/api/appointments', appointmentRoutes);

// Prescription routes (Task 5)
app.use('/api/prescriptions', prescriptionRoutes);

// Communication routes (Task 6)
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// All tasks completed - no placeholder routes needed!

// All tasks completed! 🎉

// 404 handler
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;