# 🗄️ ArogyaMitra Database Setup Guide

## 🎯 **Quick Setup Options (Choose One)**

---

## **🚀 Option 1: Railway (RECOMMENDED - Easiest)**

### **Why Railway?**
- ✅ **Free tier** with PostgreSQL
- ✅ **No setup required** - just click and connect
- ✅ **Automatic backups**
- ✅ **Production ready**

### **Setup Steps:**
1. **Go to Railway:** https://railway.app
2. **Sign up** with GitHub
3. **Create New Project** → **Add PostgreSQL**
4. **Copy Database URL** from Railway dashboard
5. **Paste in your .env file**

```bash
# In arogyamitra/backend/.env
DATABASE_URL="postgresql://username:password@host:port/database"
```

---

## **🐳 Option 2: Docker (Local Development)**

### **Setup Steps:**
```bash
# Start PostgreSQL container
docker run --name arogyamitra-postgres \
  -e POSTGRES_DB=arogyamitra \
  -e POSTGRES_USER=arogyamitra \
  -e POSTGRES_PASSWORD=arogyamitra_dev_password \
  -p 5432:5432 -d postgres:15

# Your DATABASE_URL will be:
DATABASE_URL="postgresql://arogyamitra:arogyamitra_dev_password@localhost:5432/arogyamitra"
```

---

## **☁️ Option 3: AWS RDS (Production)**

### **Setup Steps:**
1. **Go to AWS Console** → RDS
2. **Create Database** → PostgreSQL
3. **Choose Free Tier** (if eligible)
4. **Configure:**
   - DB Name: `arogyamitra`
   - Username: `arogyamitra`
   - Password: `your-secure-password`
5. **Copy endpoint** from RDS dashboard

```bash
# Your DATABASE_URL will be:
DATABASE_URL="postgresql://arogyamitra:password@your-rds-endpoint:5432/arogyamitra"
```

---

## **💻 Option 4: Local PostgreSQL (If you have it installed)**

```bash
# Create database
createdb arogyamitra

# Your DATABASE_URL will be:
DATABASE_URL="postgresql://your-username@localhost:5432/arogyamitra"
```

---

## **🎯 RECOMMENDED: Railway Setup (5 minutes)**

### **Step-by-Step Railway Setup:**

1. **Visit:** https://railway.app
2. **Click "Start a New Project"**
3. **Select "Provision PostgreSQL"**
4. **Copy the DATABASE_URL** from the Connect tab
5. **Update your .env file:**

```bash
cd arogyamitra/backend
cp .env.example .env
# Edit .env and paste your DATABASE_URL
```

6. **Generate Prisma client and setup:**
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

7. **Start your server:**
```bash
npm run dev
```

---

## **🧪 Test Database Connection:**

Once set up, test with:
```bash
curl http://localhost:3001/health
```

Should return database status as "connected".

---

## **💡 About AWS S3 (For Later):**

**S3 is for file storage, not database!** We'll use S3 later for:
- ✅ **Profile images**
- ✅ **Medical documents**
- ✅ **Prescription attachments**
- ✅ **Chat file uploads**

But for now, we need PostgreSQL for user data, appointments, etc.

---

## **🚀 Quick Start (Railway):**

```bash
# 1. Get Railway database (5 minutes)
# Visit https://railway.app → Create PostgreSQL

# 2. Configure environment
cd arogyamitra/backend
cp .env.example .env
# Paste your Railway DATABASE_URL

# 3. Setup database
npm run db:generate
npm run db:push
npm run db:seed

# 4. Start server
npm run dev

# 5. Test authentication
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "PATIENT"
  }'
```

**Railway is the fastest way to get started!** 🚀