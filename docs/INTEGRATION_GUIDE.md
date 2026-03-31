# 🔗 ArogyaMitra Frontend-Backend Integration Guide

## 🚀 **Quick Start - Connect Everything**

### **1. Start Both Servers (Automated)**
```bash
# Navigate to project root
cd arogyamitra

# Start both backend and frontend automatically
./start-development.sh
```

This will:
- ✅ Install dependencies if needed
- ✅ Set up the database
- ✅ Start backend on http://localhost:3002
- ✅ Start frontend on http://localhost:3000
- ✅ Handle graceful shutdown with Ctrl+C

### **2. Manual Start (Alternative)**
```bash
# Terminal 1 - Backend
cd arogyamitra/backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Terminal 2 - Frontend  
cd arogyamitra/frontend
npm install
npm run dev
```

### **3. Test Integration**
```bash
# Run comprehensive integration tests
./test-integration.sh
```

---

## 🔧 **Connection Configuration**

### **Backend Configuration:**
```javascript
// backend/src/app.ts
const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
```

### **Frontend Configuration:**
```javascript
// frontend/src/lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
  timeout: 10000,
});

// Auto-attach JWT tokens
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### **Environment Variables:**
```bash
# backend/.env
DATABASE_URL="postgresql://username:password@localhost:5432/arogyamitra"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3002

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3002/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 **Testing the Connection**

### **1. API Health Check**
```bash
curl http://localhost:3002/health
# Expected: {"status": "OK", "timestamp": "..."}
```

### **2. User Registration Test**
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890",
    "role": "PATIENT"
  }'
```

### **3. User Login Test**
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### **4. Frontend Pages Test**
- ✅ Home: http://localhost:3000
- ✅ Login: http://localhost:3000/auth/login
- ✅ Register: http://localhost:3000/auth/register
- ✅ Dashboard: http://localhost:3000/dashboard (after login)

---

## 🔄 **Complete User Flow Test**

### **Step 1: Registration**
1. Visit http://localhost:3000
2. Click "Get Started" or "Sign up"
3. Fill registration form (Patient/Doctor)
4. Submit form
5. Should redirect to dashboard

### **Step 2: Login**
1. Visit http://localhost:3000/auth/login
2. Enter email and password
3. Click "Sign In"
4. Should redirect to role-based dashboard

### **Step 3: Dashboard Features**
1. **Patient Dashboard:**
   - View appointment stats
   - See upcoming appointments
   - Check medication reminders
   - Browse recent activity

2. **Doctor Dashboard:**
   - View today's schedule
   - Check patient stats
   - See earnings overview
   - Access quick actions

### **Step 4: Core Features**
1. **Doctor Search:**
   - Visit /doctors
   - Search by specialty/location
   - Filter by price/rating
   - View doctor profiles

2. **Appointments:**
   - Visit /appointments
   - View upcoming/past appointments
   - Reschedule/cancel appointments
   - Join video calls

3. **Medications:**
   - Visit /medications
   - Track active medications
   - Mark doses as taken
   - View adherence stats

4. **Messages:**
   - Visit /messages
   - Chat with doctors/patients
   - Send/receive messages
   - View conversation history

5. **Profile:**
   - Visit /profile
   - Edit personal information
   - Update contact details
   - Manage emergency contacts

---

## 🔐 **Authentication Flow**

### **Registration Process:**
```
Frontend Form → POST /api/auth/register → JWT Token → Auto Login → Dashboard
```

### **Login Process:**
```
Frontend Form → POST /api/auth/login → JWT Token → Store in localStorage → Dashboard
```

### **Protected Routes:**
```
Frontend Request → Check localStorage Token → Add to Headers → API Call → Response
```

### **Token Refresh:**
```
API 401 Response → Clear localStorage → Redirect to Login
```

---

## 📊 **API Endpoints Integration**

### **Authentication Endpoints:**
```javascript
// Registration
POST /api/auth/register
Body: { firstName, lastName, email, password, phone, role }
Response: { user, accessToken }

// Login  
POST /api/auth/login
Body: { email, password }
Response: { user, accessToken }

// Logout
POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { message: "Logged out successfully" }
```

### **User Management:**
```javascript
// Get Profile
GET /api/users/profile
Headers: { Authorization: Bearer <token> }
Response: { user }

// Update Profile
PUT /api/users/profile  
Headers: { Authorization: Bearer <token> }
Body: { firstName, lastName, phone, ... }
Response: { user }
```

### **Doctor Management:**
```javascript
// Search Doctors
GET /api/doctors/search?specialty=&location=&page=1
Response: { doctors, pagination }

// Get Doctor Profile
GET /api/doctors/:id
Response: { doctor }

// Get Available Slots
GET /api/doctors/:id/slots?date=2025-08-12
Response: { slots }
```

### **Appointment Management:**
```javascript
// Book Appointment
POST /api/appointments/book
Headers: { Authorization: Bearer <token> }
Body: { doctorProfileId, appointmentDate, startTime, symptoms }
Response: { appointment }

// Get My Appointments
GET /api/appointments/my
Headers: { Authorization: Bearer <token> }
Response: { appointments }

// Reschedule Appointment
POST /api/appointments/:id/reschedule
Headers: { Authorization: Bearer <token> }
Body: { newDate, newTime }
Response: { appointment }
```

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **1. CORS Errors**
```
Error: Access to XMLHttpRequest blocked by CORS policy
Solution: Check backend CORS configuration includes frontend URL
```

#### **2. Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:3002
Solution: Ensure backend server is running on port 3002
```

#### **3. 401 Unauthorized**
```
Error: Request failed with status code 401
Solution: Check JWT token in localStorage and API headers
```

#### **4. Database Connection**
```
Error: Can't reach database server
Solution: Check DATABASE_URL in backend/.env
```

### **Debug Commands:**
```bash
# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :3002  # Backend

# Check backend logs
cd arogyamitra/backend && npm run dev

# Check frontend logs  
cd arogyamitra/frontend && npm run dev

# Test API directly
curl -v http://localhost:3002/api/health

# Check database connection
cd arogyamitra/backend && npx prisma studio
```

---

## 🎯 **Production Deployment**

### **Backend Deployment (Railway/Heroku):**
```bash
# Build backend
cd backend
npm run build

# Set environment variables
DATABASE_URL=postgresql://...
JWT_SECRET=production-secret
PORT=3002
```

### **Frontend Deployment (Vercel/Netlify):**
```bash
# Build frontend
cd frontend  
npm run build

# Set environment variables
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
```

---

## ✅ **Integration Checklist**

- [ ] Backend server starts on port 3002
- [ ] Frontend server starts on port 3000
- [ ] Database connection established
- [ ] CORS configured correctly
- [ ] JWT authentication working
- [ ] API endpoints responding
- [ ] Frontend pages loading
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes secured
- [ ] Dashboard displays data
- [ ] Doctor search functional
- [ ] Appointment booking works
- [ ] Messaging system active
- [ ] Profile management works

---

## 🎉 **Success Indicators**

When everything is connected correctly, you should see:

1. ✅ **Backend Console:**
   ```
   🏥 ArogyaMitra Backend Server
   🚀 Server running on http://localhost:3002
   📊 API Documentation: http://localhost:3002/api-docs
   ✅ Database connected successfully
   ```

2. ✅ **Frontend Console:**
   ```
   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   - Network:      http://192.168.1.x:3000
   ✓ Ready in 2.3s
   ```

3. ✅ **Browser Network Tab:**
   - API calls to http://localhost:3002/api/*
   - Status codes: 200, 201, 401 (as expected)
   - JWT tokens in Authorization headers
   - CORS headers present

4. ✅ **User Experience:**
   - Smooth registration/login flow
   - Dashboard loads with real data
   - All features work end-to-end
   - No console errors

**🚀 When you see all these indicators, your ArogyaMitra platform is fully connected and ready for users!**