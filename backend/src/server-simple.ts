import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3011',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'ArogyaMitra API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// Mock auth endpoints for testing
app.post('/api/auth/register', (req, res) => {
  res.status(201).json({
    success: true,
    data: {
      user: {
        id: '1',
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role
      },
      accessToken: 'mock-jwt-token'
    }
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: req.body.email,
        role: 'PATIENT'
      },
      accessToken: 'mock-jwt-token'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 ArogyaMitra Backend Server`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`✅ Ready for connections`);
});