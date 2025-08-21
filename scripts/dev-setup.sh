#!/bin/bash

# ArogyaMitra Development Setup Script
echo "🚀 Setting up ArogyaMitra development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "⚠️  Docker is not running. Please start Docker to use the database."
    echo "   You can still run the setup, but you'll need to configure PostgreSQL manually."
else
    echo "✅ Docker is running"
    
    # Start database
    echo "🗄️  Starting database..."
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 10
fi

# Setup backend
echo "🔧 Setting up backend..."
cd backend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created backend/.env file. Please update it with your configuration."
fi

# Generate Prisma client
npm run db:generate

# Push database schema
if docker info &> /dev/null; then
    echo "📊 Setting up database schema..."
    npm run db:push
    
    # Seed database
    echo "🌱 Seeding database with sample data..."
    npm run db:seed
fi

cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "📝 Created frontend/.env.local file. Please update it with your configuration."
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment variables in backend/.env and frontend/.env.local"
echo "2. Start development servers: npm run dev"
echo "3. Visit http://localhost:3000 for frontend"
echo "4. Visit http://localhost:3001/api/health for backend health check"
echo ""
echo "📚 Demo accounts (password: password123):"
echo "   👤 Admin: admin@arogyamitra.com"
echo "   🏥 Doctor: dr.wilson@hospital.com"
echo "   👨‍⚕️ Patient: patient1@example.com"