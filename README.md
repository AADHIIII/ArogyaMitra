# 🏥 ArogyaMitra Healthcare Platform

> **Complete Full-Stack Healthcare Management System**  
> Connecting patients with healthcare providers through modern technology

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

## 🌟 **Features**

### **👥 For Patients**
- 🔍 **Doctor Discovery** - Search and filter doctors by specialty, location, rating
- 📅 **Appointment Booking** - Easy scheduling with real-time availability
- 💊 **Medication Management** - Track prescriptions and medication adherence
- 💬 **Secure Messaging** - Direct communication with healthcare providers
- 📊 **Health Dashboard** - Personal health overview and statistics

### **👨‍⚕️ For Doctors**
- 📋 **Patient Management** - Comprehensive patient records and history
- 🗓️ **Schedule Management** - Flexible availability and appointment slots
- 💊 **Prescription System** - Digital prescription creation and management
- 💬 **Patient Communication** - Secure messaging with patients
- 📈 **Analytics Dashboard** - Practice insights and performance metrics

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- PostgreSQL database (or use our Supabase setup)
- Git

### **1. Clone the Repository**
\`\`\`bash
git clone https://github.com/your-username/arogyamitra.git
cd arogyamitra
\`\`\`

### **2. Install Dependencies**
\`\`\`bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
\`\`\`

### **3. Environment Setup**
\`\`\`bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL and JWT secret

# Frontend environment  
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with API URLs
\`\`\`

### **4. Start Development Servers**
\`\`\`bash
# Option 1: Start both servers automatically
./start-development.sh

# Option 2: Start manually
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
\`\`\`

### **5. Access the Application**
- 🌐 **Frontend**: http://localhost:3011
- 🔧 **Backend API**: http://localhost:3010
- 📊 **API Health**: http://localhost:3010/health

## 🏗️ **Architecture**

### **Technology Stack**

#### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

#### **Backend**
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Zod schemas

### **Project Structure**
\`\`\`
arogyamitra/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── routes/          # API route definitions
│   │   └── utils/           # Helper functions
│   ├── prisma/              # Database schema & migrations
│   └── tests/               # API tests
├── frontend/                # Next.js web application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities & API client
│   │   └── stores/          # State management
│   └── public/              # Static assets
└── docs/                    # Documentation
\`\`\`

## 📊 **API Documentation**

### **Authentication Endpoints**
\`\`\`http
POST /api/auth/register      # User registration
POST /api/auth/login         # User login
POST /api/auth/logout        # User logout
\`\`\`

### **User Management**
\`\`\`http
GET    /api/users/profile    # Get user profile
PUT    /api/users/profile    # Update user profile
\`\`\`

### **Doctor Management**
\`\`\`http
GET  /api/doctors/search     # Search doctors
GET  /api/doctors/:id        # Get doctor details
GET  /api/doctors/:id/slots  # Get available slots
\`\`\`

### **Appointment System**
\`\`\`http
POST /api/appointments/book        # Book appointment
GET  /api/appointments/my          # Get user appointments
PUT  /api/appointments/:id         # Update appointment
\`\`\`

## 🧪 **Testing**

### **Run Tests**
\`\`\`bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Integration tests
./test-integration.sh
\`\`\`

## 🚀 **Deployment**

### **Production Build**
\`\`\`bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build
\`\`\`

### **Environment Variables**
\`\`\`env
# Backend (.env)
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=3010

# Frontend (.env.local)
NEXT_PUBLIC_API_URL="https://your-api.com/api"
NEXT_PUBLIC_APP_URL="https://your-app.com"
\`\`\`

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Next.js Team** - For the amazing React framework
- **Prisma Team** - For the excellent database toolkit
- **Tailwind CSS** - For the utility-first CSS framework
- **Healthcare Community** - For inspiration and requirements

## 📞 **Support**

- 📧 [Email Support](mailto:support@arogyamitra.com)
- 🐛 [Bug Reports](https://github.com/your-username/arogyamitra/issues)
- 💡 [Feature Requests](https://github.com/your-username/arogyamitra/discussions)

---

<div align="center">

**Built with ❤️ for better healthcare access**

[🌐 Website](https://arogyamitra.com) • [📱 Demo](http://localhost:3011) • [📧 Contact](mailto:hello@arogyamitra.com)

</div>