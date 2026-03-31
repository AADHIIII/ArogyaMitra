#!/bin/bash

# ArogyaMitra Integration Test Script
echo "🧪 Testing ArogyaMitra Frontend-Backend Integration..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URLs
BACKEND_URL="http://localhost:3002"
FRONTEND_URL="http://localhost:3000"
API_URL="$BACKEND_URL/api"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test API endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5
    
    echo -e "${BLUE}Testing: $description${NC}"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "%{http_code}" -X $method \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X $method "$API_URL$endpoint")
    fi
    
    status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS: $description (Status: $status_code)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $description (Expected: $expected_status, Got: $status_code)${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Function to check if server is running
check_server() {
    local url=$1
    local name=$2
    
    echo -e "${BLUE}Checking $name server...${NC}"
    
    if curl -s --head "$url" > /dev/null; then
        echo -e "${GREEN}✅ $name server is running at $url${NC}"
        return 0
    else
        echo -e "${RED}❌ $name server is not running at $url${NC}"
        return 1
    fi
}

echo "🔍 Checking server status..."
echo "================================"

# Check if backend is running
if ! check_server "$BACKEND_URL/health" "Backend"; then
    echo -e "${RED}Backend server is not running. Please start it first.${NC}"
    exit 1
fi

# Check if frontend is running
if ! check_server "$FRONTEND_URL" "Frontend"; then
    echo -e "${YELLOW}Frontend server is not running, but we can still test the API.${NC}"
fi

echo ""
echo "🧪 Running API Integration Tests..."
echo "=================================="

# Test 1: Health Check
test_endpoint "GET" "/health" "200" "Health Check Endpoint"

# Test 2: User Registration
test_endpoint "POST" "/auth/register" "201" "User Registration" '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "PATIENT"
}'

# Test 3: User Login
LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@example.com",
        "password": "password123"
    }' \
    "$API_URL/auth/login")

if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}✅ PASS: User Login (Token received)${NC}"
    ((TESTS_PASSED++))
    
    # Extract token for authenticated requests
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo -e "${BLUE}Token extracted for authenticated tests${NC}"
else
    echo -e "${RED}❌ FAIL: User Login (No token received)${NC}"
    ((TESTS_FAILED++))
    TOKEN=""
fi
echo ""

# Test 4: Get User Profile (Authenticated)
if [ -n "$TOKEN" ]; then
    echo -e "${BLUE}Testing: Get User Profile (Authenticated)${NC}"
    PROFILE_RESPONSE=$(curl -s -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        "$API_URL/users/profile")
    
    status_code="${PROFILE_RESPONSE: -3}"
    
    if [ "$status_code" = "200" ]; then
        echo -e "${GREEN}✅ PASS: Get User Profile (Status: $status_code)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: Get User Profile (Expected: 200, Got: $status_code)${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
fi

# Test 5: Get Doctors List
test_endpoint "GET" "/doctors/search" "200" "Get Doctors List"

# Test 6: Get Medical Specialties
test_endpoint "GET" "/doctors/specialties" "200" "Get Medical Specialties"

# Test 7: Unauthorized Access Test
echo -e "${BLUE}Testing: Unauthorized Access Protection${NC}"
UNAUTH_RESPONSE=$(curl -s -w "%{http_code}" "$API_URL/users/profile")
status_code="${UNAUTH_RESPONSE: -3}"

if [ "$status_code" = "401" ]; then
    echo -e "${GREEN}✅ PASS: Unauthorized Access Protection (Status: $status_code)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Unauthorized Access Protection (Expected: 401, Got: $status_code)${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# Test 8: CORS Headers
echo -e "${BLUE}Testing: CORS Headers${NC}"
CORS_RESPONSE=$(curl -s -I -X OPTIONS \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    "$API_URL/auth/login")

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ PASS: CORS Headers Present${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: CORS Headers Missing${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# Frontend Integration Tests (if frontend is running)
if curl -s --head "$FRONTEND_URL" > /dev/null; then
    echo "🌐 Testing Frontend Integration..."
    echo "================================="
    
    # Test 9: Frontend Home Page
    echo -e "${BLUE}Testing: Frontend Home Page${NC}"
    if curl -s "$FRONTEND_URL" | grep -q "ArogyaMitra"; then
        echo -e "${GREEN}✅ PASS: Frontend Home Page Loads${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: Frontend Home Page${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
    
    # Test 10: Frontend Login Page
    echo -e "${BLUE}Testing: Frontend Login Page${NC}"
    if curl -s "$FRONTEND_URL/auth/login" | grep -q "Sign In"; then
        echo -e "${GREEN}✅ PASS: Frontend Login Page Loads${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: Frontend Login Page${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
fi

# Summary
echo "📊 Test Results Summary"
echo "======================"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Integration is working correctly.${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Please check the issues above.${NC}"
    exit 1
fi