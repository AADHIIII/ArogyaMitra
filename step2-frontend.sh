#!/bin/bash

echo "🌐 STEP 2: Starting ArogyaMitra Frontend Server..."
echo "================================================="

cd frontend

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🚀 Starting frontend server on http://localhost:3011..."
npm run dev -- --port 3011