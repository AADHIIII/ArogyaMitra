#!/bin/bash

# ArogyaMitra + Supabase Setup Script
echo "🚀 ArogyaMitra + Supabase Setup"
echo "==============================="
echo ""
echo "🎯 Supabase is PERFECT for ArogyaMitra because it provides:"
echo "   ✅ PostgreSQL Database"
echo "   ✅ Real-time subscriptions (for chat/notifications)"
echo "   ✅ File storage (for medical documents)"
echo "   ✅ Row Level Security (for healthcare data)"
echo "   ✅ Built-in authentication"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/package.json" ]; then
    echo "❌ Please run this script from the arogyamitra root directory"
    exit 1
fi

cd backend

echo "🔧 Setting up environment..."

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo ""
    echo "🎯 NEXT STEPS:"
    echo "1. Go to https://supabase.com"
    echo "2. Create new project: 'ArogyaMitra'"
    echo "3. Go to Settings → Database"
    echo "4. Copy the Connection String (URI format)"
    echo "5. Update DATABASE_URL in backend/.env"
    echo ""
    echo "Your Supabase URL looks like:"
    echo "postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres"
    echo ""
    echo "After updating DATABASE_URL, run this script again."
    exit 0
else
    echo "✅ Found existing .env file"
fi

echo ""
echo "🔍 Checking DATABASE_URL..."

# Check if DATABASE_URL contains supabase
if grep -q "DATABASE_URL.*supabase.co" .env; then
    echo "✅ Supabase DATABASE_URL found in .env"
elif grep -q "DATABASE_URL.*postgresql://" .env; then
    echo "⚠️  PostgreSQL URL found, but not Supabase"
    echo "   This will work, but you'll miss Supabase features"
else
    echo "❌ DATABASE_URL not properly configured in .env"
    echo ""
    echo "Please update DATABASE_URL in backend/.env with your Supabase connection string."
    echo "Get it from: https://supabase.com → Your Project → Settings → Database"
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
echo "🗄️ Setting up database schema in Supabase..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to push database schema to Supabase"
    echo "Please check your Supabase connection"
    exit 1
fi

echo ""
echo "🌱 Seeding Supabase database with sample data..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed Supabase database"
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
echo "🎉 Supabase setup completed successfully!"
echo ""
echo "📊 Check your Supabase Dashboard:"
echo "   🔗 https://supabase.com/dashboard"
echo "   📋 View your tables and data"
echo "   🔍 Run SQL queries"
echo "   📈 Monitor API usage"
echo ""
echo "📋 Demo Accounts Created:"
echo "👤 Admin: admin@arogyamitra.com / password123"
echo "🏥 Doctor: doctor@example.com / password123"
echo "👨‍⚕️ Patient: patient@example.com / password123"
echo ""
echo "🚀 Start the server with: npm run dev"
echo "🧪 Test authentication: ../test-auth.sh"
echo ""
echo "🎯 Supabase Features Available:"
echo "   ✅ PostgreSQL Database (active)"
echo "   🔄 Real-time subscriptions (ready for Task 6)"
echo "   📁 File storage (ready for profile images)"
echo "   🔐 Row Level Security (ready for healthcare data)"
echo ""
echo "✅ Ready for Task 2 completion!"