# 🔄 ArogyaMitra - After Computer Restart Guide

## 🎯 **After Restarting Your Computer:**

All ports should now be free! Let's get ArogyaMitra running fresh.

---

## **STEP 1: Check Ports Are Free** ✅

```bash
cd arogyamitra
lsof -i :3010 :3011
```

**✅ Good Result:** No output (ports are free)  
**❌ Bad Result:** Shows processes using ports

---

## **STEP 2: Start Backend** 🔧

```bash
cd arogyamitra
./step1-backend.sh
```

**✅ Success when you see:**
```
🏥 ArogyaMitra Backend Server
🚀 Server running on http://localhost:3010
✅ Ready for connections
```

---

## **STEP 3: Start Frontend** 🌐

**Open a NEW terminal window:**

```bash
cd arogyamitra
./step2-frontend.sh
```

**✅ Success when you see:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3011
✓ Ready in 2.3s
```

---

## **STEP 4: Open Website** 🎉

```bash
cd arogyamitra
./step3-open.sh
```

**Or manually visit:** http://localhost:3011

---

## **🎯 What You Should See:**

1. **ArogyaMitra Homepage** - Professional healthcare design
2. **"Your Doctor in Your Pocket"** - Main headline
3. **Two buttons:** "I'm a Patient" and "I'm a Doctor"
4. **Clean, modern interface** with blue and white colors

---

## **🚀 Test the Complete Flow:**

1. **Click "I'm a Patient"** → Registration form
2. **Fill out the form** → Create account
3. **Login** → Patient dashboard
4. **Explore features:**
   - Search doctors
   - View appointments
   - Check medications
   - Send messages

---

## **📱 Final URLs After Restart:**

- **🌐 Main Website:** http://localhost:3011
- **🔧 Backend API:** http://localhost:3010
- **📊 Health Check:** http://localhost:3010/health

---

## **🆘 If Still Having Issues:**

### **Manual Port Check:**
```bash
# Check what's using ports
netstat -an | grep :3010
netstat -an | grep :3011

# Kill any processes if needed
sudo lsof -ti:3010 | xargs kill -9
sudo lsof -ti:3011 | xargs kill -9
```

### **Alternative Ports:**
If 3010/3011 are still busy, we can use 8080/8081:

```bash
# Edit backend/.env
PORT=8080

# Edit frontend/.env.local  
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:8081

# Start with different ports
cd backend && PORT=8080 npm run dev
cd frontend && npm run dev -- --port 8081
```

---

**🎊 After restart, the ports should be completely free and ArogyaMitra should start perfectly! 🏥✨**

**Let me know what happens after you restart!**