#!/bin/bash

# ArogyaMitra Database Setup Script
echo "🗄️ ArogyaMitra Database Setup"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Please run this script from the arogyamitra root directory"
    exit 1
fi

cd backend

echo ""
echo "🔧 Setting up environment..."

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "⚠️  IMPORTANT: You need to update DATABASE_URL in backend/.env"
    echo ""
    echo "📋 Database Options:"
    echo "1. Railway (Recommended): https://railway.app"
    echo "2. Docker: docker run --name arogyamitra-postgres -e POSTGRES_DB=arogyamitra -e POSTGRES_USER=arogyamitra -e POSTGRES_PASSWORD=arogyamitra_dev_password -p 5432:5432 -d postgres:15"
    echo "3. AWS RDS: Create PostgreSQL instance in AWS Console"
    echo ""
    echo "After setting up your database, update DATABASE_URL in backend/.env and run this script again."
    exit 0
else
    echo "✅ Found existing .env file"
fi

echo ""
echo "🔍 Checking DATABASE_URL..."

# Check if DATABASE_URL is set
if grep -q "DATABASE_URL.*postgresql://" .env; then
    echo "✅ DATABASE_URL found in .env"
else
    echo "❌ DATABASE_URL not properly configured in .env"
    echo ""
    echo "Please update DATABASE_URL in backend/.env with your database connection string."
    echo "Example: DATABASE_URL=\"postgresql://username:password@host:port/database\""
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Generating Prisma client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    echo "Please check your DATABASE_URL in backend/.env"
    exit 1
fi

echo ""
echo "🗄️ Setting up database schema..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema"
    echo "Please check your database connection"
    exit 1
fi

echo ""
echo "🌱 Seeding database with sample data..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    echo "Database schema created but seeding failed"
fi

echo ""
echo "🏗️ Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build application"
    exit 1
fi

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📋 Demo Accounts Created:"
echo "👤 Admin: admin@arogyamitra.com / password123"
echo "🏥 Doctor: doctor@example.com / password123"
echo "👨‍⚕️ Patient: patient@example.com / password123"
echo ""
echo "🚀 Start the server with: npm run dev"
echo "🧪 Test health check: curl http://localhost:3001/health"
echo ""
echo "✅ Ready for Task 2 completion!"