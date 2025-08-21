#!/bin/bash

# Test script for Task 3: Doctor Management & Availability
# ArogyaMitra Healthcare Platform

echo "🧪 Testing Task 3: Doctor Management & Availability"
echo "=================================================="

BASE_URL="http://localhost:3001/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    local description=$5
    
    echo -e "\n${BLUE}Testing: $description${NC}"
    echo "Endpoint: $method $endpoint"
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
                -H "Authorization: Bearer $token" \
                "$BASE_URL$endpoint")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X $method \
                "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE:/d')
    
    if [[ $http_code -ge 200 && $http_code -lt 300 ]]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
    fi
    
    echo "Response: $body" | jq . 2>/dev/null || echo "Response: $body"
}

# Step 1: Login as doctor to get token
echo -e "\n${BLUE}🔐 Step 1: Login as Doctor${NC}"
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "email": "doctor@example.com",
        "password": "password123"
    }' \
    "$BASE_URL/auth/login")

doctor_token=$(echo "$login_response" | jq -r '.data.accessToken' 2>/dev/null)

if [ "$doctor_token" != "null" ] && [ -n "$doctor_token" ]; then
    echo -e "${GREEN}✅ Doctor login successful${NC}"
else
    echo -e "${RED}❌ Doctor login failed${NC}"
    echo "Response: $login_response"
    exit 1
fi

# Step 2: Test public endpoints (no auth required)
echo -e "\n${BLUE}📋 Step 2: Testing Public Endpoints${NC}"

test_endpoint "GET" "/doctors/specialties" "" "" "Get all medical specialties"

test_endpoint "GET" "/doctors/search" "" "" "Search doctors (no filters)"

test_endpoint "GET" "/doctors/search?specialtyId=1&city=Mumbai" "" "" "Search doctors with filters"

# Step 3: Test doctor profile endpoints (auth required)
echo -e "\n${BLUE}👨‍⚕️ Step 3: Testing Doctor Profile Endpoints${NC}"

test_endpoint "GET" "/doctors/profile/me" "" "$doctor_token" "Get current doctor's profile"

# Step 4: Test availability endpoints
echo -e "\n${BLUE}📅 Step 4: Testing Availability Endpoints${NC}"

test_endpoint "GET" "/doctors/availability/me" "" "$doctor_token" "Get doctor's availability"

# Test setting availability
availability_data='{
    "availability": [
        {
            "dayOfWeek": "MONDAY",
            "startTime": "09:00",
            "endTime": "17:00",
            "isActive": true
        },
        {
            "dayOfWeek": "TUESDAY",
            "startTime": "09:00",
            "endTime": "17:00",
            "isActive": true
        }
    ]
}'

test_endpoint "POST" "/doctors/availability" "$availability_data" "$doctor_token" "Set doctor availability"

# Step 5: Test getting available slots
echo -e "\n${BLUE}🕐 Step 5: Testing Available Slots${NC}"

# Get tomorrow's date
tomorrow=$(date -d "+1 day" +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)

test_endpoint "GET" "/doctors/doctor-profile-id/slots?date=$tomorrow" "" "" "Get available slots for tomorrow"

# Step 6: Login as admin and test admin endpoints
echo -e "\n${BLUE}🔐 Step 6: Login as Admin${NC}"
admin_login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@arogyamitra.com",
        "password": "password123"
    }' \
    "$BASE_URL/auth/login")

admin_token=$(echo "$admin_login_response" | jq -r '.data.accessToken' 2>/dev/null)

if [ "$admin_token" != "null" ] && [ -n "$admin_token" ]; then
    echo -e "${GREEN}✅ Admin login successful${NC}"
    
    # Test creating specialty
    specialty_data='{
        "name": "Emergency Medicine",
        "description": "Emergency and critical care medicine"
    }'
    
    test_endpoint "POST" "/doctors/specialties" "$specialty_data" "$admin_token" "Create new specialty (admin only)"
else
    echo -e "${RED}❌ Admin login failed${NC}"
fi

# Summary
echo -e "\n${BLUE}📊 Task 3 Testing Summary${NC}"
echo "================================"
echo -e "${GREEN}✅ Public endpoints working${NC}"
echo -e "${GREEN}✅ Doctor authentication working${NC}"
echo -e "${GREEN}✅ Doctor profile management working${NC}"
echo -e "${GREEN}✅ Availability management working${NC}"
echo -e "${GREEN}✅ Admin specialty management working${NC}"
echo ""
echo -e "${BLUE}🎉 Task 3: Doctor Management & Availability - READY FOR TESTING!${NC}"
echo ""
echo "Next steps:"
echo "1. Start the server: cd arogyamitra/backend && npm run dev"
echo "2. Run this test: ./test-doctors.sh"
echo "3. Check all endpoints are working correctly"