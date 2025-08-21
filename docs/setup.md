# ArogyaMitra Setup Guide

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for caching)
- Docker & Docker Compose (optional)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd arogyamitra
npm run install:all
```

### 2. Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database and service credentials

# Frontend  
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your configuration
```

### 3. Database Setup

```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Start Development

```bash
# From root directory
npm run dev
```

This will start:
- Backend API on http://localhost:3001
- Frontend on http://localhost:3000

## Docker Setup (Alternative)

```bash
# Start all services
npm run docker:up

# Stop services
npm run docker:down
```

## Project Structure

```
arogyamitra/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# Reusable components
│   │   ├── lib/       # Utilities and configurations
│   │   └── hooks/     # Custom React hooks
│   └── public/        # Static assets
├── backend/           # Express.js API
│   ├── src/
│   │   ├── controllers/# Route handlers
│   │   ├── services/  # Business logic
│   │   ├── middleware/# Express middleware
│   │   └── utils/     # Utilities
│   └── prisma/        # Database schema and migrations
├── shared/            # Shared types and utilities
└── docs/              # Documentation
```

## Development Workflow

1. **Database Changes**: Update `backend/prisma/schema.prisma` then run `npm run db:push`
2. **API Changes**: Update backend controllers/services
3. **Frontend Changes**: Update frontend components/pages
4. **Type Safety**: Shared types in `/shared` ensure consistency

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

## Deployment

See [deployment.md](./deployment.md) for production deployment instructions.