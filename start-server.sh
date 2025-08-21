#!/bin/bash

echo "🚀 Starting ArogyaMitra Server"
echo "=============================="

# Kill any existing process on port 3002
echo "🔍 Checking for existing processes on port 3002..."
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "No existing processes found"

# Navigate to backend directory
cd backend

# Start the server
echo "🚀 Starting server on port 3002..."
npm run dev