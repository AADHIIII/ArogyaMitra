#!/bin/bash

# ArogyaMitra Authentication Test Script
echo "🧪 Testing ArogyaMitra Authentication System"
echo "==========================================="

BASE_URL="http://localhost:3001"

echo ""
echo "1️⃣ Testing server health..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
if echo "$HEALTH_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Server is healthy"
else
    echo "❌ Server health check failed"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi

echo ""
echo "2️⃣ Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "testuser@example.com",
        "password": "SecurePass123!",
        "firstName": "Test",
        "lastName": "User",
        "role": "PATIENT"
    }')

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    echo "✅ User registration successful"
    # Extract token from response
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ User registration failed"
    echo "Response: $REGISTER_RESPONSE"
    exit 1
fi

echo ""
echo "3️⃣ Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "testuser@example.com",
        "password": "SecurePass123!"
    }')

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    echo "✅ User login successful"
    # Extract token from login response
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ User login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo "4️⃣ Testing protected route (get profile)..."
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Protected route access successful"
else
    echo "❌ Protected route access failed"
    echo "Response: $PROFILE_RESPONSE"
    exit 1
fi

echo ""
echo "5️⃣ Testing profile update..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/users/profile" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "firstName": "Updated",
        "phone": "+1234567890"
    }')

if echo "$UPDATE_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Profile update successful"
else
    echo "❌ Profile update failed"
    echo "Response: $UPDATE_RESPONSE"
    exit 1
fi

echo ""
echo "6️⃣ Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
    -H "Authorization: Bearer $TOKEN")

if echo "$LOGOUT_RESPONSE" | grep -q '"success":true'; then
    echo "✅ User logout successful"
else
    echo "❌ User logout failed"
    echo "Response: $LOGOUT_RESPONSE"
    exit 1
fi

echo ""
echo "🎉 All authentication tests passed!"
echo ""
echo "✅ Task 2: Authentication System - COMPLETED"
echo ""
echo "📋 Tested Features:"
echo "   ✅ User Registration"
echo "   ✅ User Login"
echo "   ✅ JWT Token Authentication"
echo "   ✅ Protected Route Access"
echo "   ✅ Profile Management"
echo "   ✅ User Logout"
echo ""
echo "🚀 Ready to move to Task 3: Doctor Management!"