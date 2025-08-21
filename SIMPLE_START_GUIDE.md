# 🚀 ArogyaMitra - 3 Simple Steps to Start

## 📋 **What We're Doing:**
Getting the ArogyaMitra healthcare platform running on your computer in 3 easy steps.

---

## **STEP 1: Start the Backend Server** 🔧

Open Terminal 1 and run:

```bash
cd arogyamitra/backend
npm run dev
```

**✅ Success when you see:**
```
🏥 ArogyaMitra Backend Server
🚀 Server running on http://localhost:3008
✅ Ready for connections
```

**❌ If you get errors:**
- Run `npm install` first, then try again
- Make sure you're in the `arogyamitra/backend` folder

---

## **STEP 2: Start the Frontend Server** 🌐

Open Terminal 2 (new terminal window) and run:

```bash
cd arogyamitra/frontend
npm run dev -- --port 3009
```

**✅ Success when you see:**
```
▲ Next.js 14.0.4
- Local:        http://localhost:3009
✓ Ready in 2.3s
```

**❌ If you get errors:**
- Run `npm install` first, then try again
- Make sure you're in the `arogyamitra/frontend` folder

---

## **STEP 3: Open the Website** 🎉

Open your web browser and go to:

**👉 http://localhost:3009**

**✅ Success when you see:**
- ArogyaMitra homepage with "Your Doctor in Your Pocket"
- "I'm a Patient" and "I'm a Doctor" buttons
- Professional healthcare design

---

## 🎯 **What to Do Next:**

1. **Click "I'm a Patient"** to register as a patient
2. **Fill out the registration form** 
3. **Login and explore the dashboard**
4. **Try searching for doctors**
5. **Book an appointment**

---

## 🆘 **If Something Goes Wrong:**

### **Backend won't start:**
```bash
cd arogyamitra/backend
npm install
npm run dev
```

### **Frontend won't start:**
```bash
cd arogyamitra/frontend  
npm install
npm run dev -- --port 3004
```

### **Can't reach the website:**
- Make sure both servers are running
- Try http://localhost:3009 (not 3000)
- Check that no other apps are using port 3009

---

## 📱 **Final URLs:**

- **🌐 Main Website:** http://localhost:3009
- **🔧 Backend API:** http://localhost:3008
- **📊 API Health:** http://localhost:3008/health

---

**That's it! 3 simple steps and ArogyaMitra is running! 🏥✨**