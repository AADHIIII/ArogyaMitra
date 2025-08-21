#!/bin/bash

echo "🔧 STEP 1: Starting ArogyaMitra Backend Server..."
echo "================================================"

cd backend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

echo "🚀 Starting backend server on http://localhost:3010..."
npm run dev