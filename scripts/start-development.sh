#!/bin/bash

# ArogyaMitra Development Startup Script
echo "🏥 Starting ArogyaMitra Healthcare Platform..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Check if required ports are available
echo -e "${BLUE}Checking ports...${NC}"
if ! check_port 3005; then
    echo -e "${RED}Backend port 3005 is in use. Please stop the process or use a different port.${NC}"
    exit 1
fi

if ! check_port 3004; then
    echo -e "${RED}Frontend port 3004 is in use. Please stop the process or use a different port.${NC}"
    exit 1
fi

# Start backend
echo -e "${BLUE}Starting Backend Server...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    npm install
fi

# Generate Prisma client if needed
echo -e "${BLUE}Setting up database...${NC}"
npx prisma generate
npx prisma db push

# Start backend in background
echo -e "${GREEN}Backend starting on http://localhost:3005${NC}"
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo -e "${BLUE}Starting Frontend Server...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}Frontend starting on http://localhost:3004${NC}"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

echo -e "${GREEN}✅ ArogyaMitra Platform Started Successfully!${NC}"
echo -e "${BLUE}📱 Frontend: http://localhost:3004${NC}"
echo -e "${BLUE}🔧 Backend API: http://localhost:3005${NC}"
echo -e "${BLUE}📊 API Docs: http://localhost:3005/api-docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Stopping servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Servers stopped successfully${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID