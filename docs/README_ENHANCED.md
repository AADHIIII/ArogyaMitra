# 🏥 ArogyaMitra Healthcare Platform

> **Complete Full-Stack Healthcare Management System**  
> Connecting patients with healthcare providers through modern technology

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![GitHub](https://img.shields.io/badge/GitHub-ArogyaMitra1-blue)](https://github.com/AADHIIII/ArogyaMitra1)

## 🌟 **Live Demo**
- 🌐 **Frontend**: http://localhost:3011
- 🔧 **Backend API**: http://localhost:3010
- 📊 **Repository**: https://github.com/AADHIIII/ArogyaMitra1

## ✨ **Features**

### **👥 For Patients**
- 🔍 **Doctor Discovery** - Search and filter doctors by specialty, location, rating
- 📅 **Appointment Booking** - Easy scheduling with real-time availability
- 💊 **Medication Management** - Track prescriptions and medication adherence
- 💬 **Secure Messaging** - Direct communication with healthcare providers
- 📊 **Health Dashboard** - Personal health overview and statistics
- 📱 **Mobile Responsive** - Perfect experience on all devices

### **👨‍⚕️ For Doctors**
- 📋 **Patient Management** - Comprehensive patient records and history
- 🗓️ **Schedule Management** - Flexible availability and appointment slots
- 💊 **Prescription System** - Digital prescription creation and management
- 💬 **Patient Communication** - Secure messaging with patients
- 📈 **Analytics Dashboard** - Practice insights and performance metrics
- 🔔 **Smart Notifications** - Appointment reminders and updates

### **🛡️ For Administrators**
- 👥 **User Management** - Manage patients, doctors, and staff
- 📊 **System Analytics** - Platform usage and performance metrics
- 🔔 **Notification System** - Broadcast important updates
- ⚙️ **System Configuration** - Platform settings and customization

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- PostgreSQL database (or use our Supabase setup)
- Git

### **1. Clone the Repository**
```bash
git clone https://github.com/AADHIIII/ArogyaMitra1.git
cd ArogyaMitra1
```

### **2. Install Dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **3. Environment Setup**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL and JWT secret

# Frontend environment  
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with API URLs
```

### **4. Database Setup**
```bash
# Generate Prisma client
cd backend
npx prisma generate

# Push database schema
npx prisma db push

# Seed database with sample data
npx prisma db seed
```

### **5. Start Development Servers**
```bash
# Option 1: Start both servers automatically
./start-development.sh

# Option 2: Start manually
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### **6. Access the Application**
- 🌐 **Frontend**: http://localhost:3011
- 🔧 **Backend API**: http://localhost:3010
- 📊 **API Health**: http://localhost:3010/health

## 🏗️ **Architecture**

### **Technology Stack**

#### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Heroicons

#### **Backend**
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Zod schemas
- **API Documentation**: Swagger/OpenAPI
- **File Upload**: Multer

#### **Database**
- **Primary**: PostgreSQL 15+
- **ORM**: Prisma with migrations
- **Connection**: Connection pooling
- **Backup**: Automated backups (production)

### **Project Structure**
```
arogyamitra/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── routes/          # API route definitions
│   │   ├── utils/           # Helper functions
│   │   └── core/            # Core system components
│   ├── prisma/              # Database schema & migrations
│   └── tests/               # API tests
├── frontend/                # Next.js web application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities & API client
│   │   └── stores/          # State management
│   └── public/              # Static assets
├── docs/                    # Documentation
├── scripts/                 # Deployment & utility scripts
└── tests/                   # Integration tests
```

## 📊 **API Documentation**

### **Authentication Endpoints**
```http
POST /api/auth/register      # User registration
POST /api/auth/login         # User login
POST /api/auth/logout        # User logout
POST /api/auth/refresh       # Token refresh
POST /api/auth/forgot-password # Password reset
```

### **User Management**
```http
GET    /api/users/profile    # Get user profile
PUT    /api/users/profile    # Update user profile
DELETE /api/users/profile    # Delete user account
```

### **Doctor Management**
```http
GET  /api/doctors/search     # Search doctors
GET  /api/doctors/:id        # Get doctor details
POST /api/doctors/profile    # Create doctor profile
PUT  /api/doctors/profile    # Update doctor profile
GET  /api/doctors/:id/slots  # Get available slots
```

### **Appointment System**
```http
POST /api/appointments/book        # Book appointment
GET  /api/appointments/my          # Get user appointments
PUT  /api/appointments/:id         # Update appointment
POST /api/appointments/:id/cancel  # Cancel appointment
```

### **Prescription Management**
```http
POST /api/prescriptions           # Create prescription
GET  /api/prescriptions/patient/:id # Get patient prescriptions
PUT  /api/prescriptions/:id       # Update prescription
```

### **Messaging System**
```http
POST /api/messages               # Send message
GET  /api/messages/conversations # Get conversations
GET  /api/messages/:conversationId # Get messages
```

## 🧪 **Testing**

### **Backend Tests**
```bash
cd backend
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Test coverage report
```

### **Frontend Tests**
```bash
cd frontend
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### **Integration Tests**
```bash
# Full system integration tests
./test-integration.sh

# Specific test suites
./test-auth.sh            # Authentication flow
./test-appointments.sh    # Appointment system
./test-doctors.sh         # Doctor management
```

## 🚀 **Deployment**

### **Development Environment**
```bash
# Start development servers
npm run dev

# Run with specific environment
NODE_ENV=development npm run dev
```

### **Production Deployment**

#### **Backend (Railway/Heroku)**
```bash
# Build for production
cd backend
npm run build

# Set environment variables
DATABASE_URL=postgresql://...
JWT_SECRET=your-production-secret
NODE_ENV=production
PORT=3010
```

#### **Frontend (Vercel/Netlify)**
```bash
# Build for production
cd frontend
npm run build

# Set environment variables
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### **Database (Supabase/Railway)**
```bash
# Run migrations
npx prisma migrate deploy

# Seed production data
npx prisma db seed
```

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up --build

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 **Configuration**

### **Backend Environment Variables**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/arogyamitra"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3010
NODE_ENV="development"

# File Upload
MAX_FILE_SIZE="10mb"
UPLOAD_PATH="./uploads"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### **Frontend Environment Variables**
```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3010/api"
NEXT_PUBLIC_APP_URL="http://localhost:3011"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true

# Third-party Services (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-maps-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-key"
```

## 🤝 **Contributing**

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### **Code Standards**
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **Conventional Commits**: Commit message format

### **Pull Request Guidelines**
- Include tests for new features
- Update documentation as needed
- Ensure all tests pass
- Follow the existing code style
- Add screenshots for UI changes

## 📈 **Project Statistics**

- **📁 Files**: 141 files
- **📝 Lines of Code**: 26,421+
- **🔧 API Endpoints**: 50+
- **🗄️ Database Tables**: 14
- **📱 Pages**: 8+ responsive pages
- **🧩 Components**: 15+ reusable components

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Next.js Team** - For the amazing React framework
- **Prisma Team** - For the excellent database toolkit
- **Tailwind CSS** - For the utility-first CSS framework
- **Radix UI** - For accessible component primitives
- **Healthcare Community** - For inspiration and requirements

## 📞 **Support**

### **Documentation**
- 📖 [API Documentation](http://localhost:3010/api-docs)
- 🎨 [UI Component Guide](./docs/ui-components.md)
- 🔧 [Deployment Guide](./docs/deployment.md)
- 🧪 [Testing Guide](./docs/testing.md)

### **Community**
- 💬 [GitHub Discussions](https://github.com/AADHIIII/ArogyaMitra1/discussions)
- 📧 [Email Support](mailto:support@arogyamitra.com)
- 🐛 [Bug Reports](https://github.com/AADHIIII/ArogyaMitra1/issues)
- 💡 [Feature Requests](https://github.com/AADHIIII/ArogyaMitra1/discussions)

## 🎯 **Roadmap**

### **Phase 1: Core Platform** ✅
- [x] User authentication and authorization
- [x] Doctor discovery and profiles
- [x] Appointment booking system
- [x] Basic messaging system
- [x] Prescription management

### **Phase 2: Enhanced Features** 🚧
- [ ] Video consultation integration
- [ ] Payment processing
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Telemedicine features

### **Phase 3: Scale & Optimize** 📋
- [ ] Multi-language support
- [ ] Advanced search with AI
- [ ] Integration with health devices
- [ ] Advanced reporting
- [ ] Enterprise features

---

<div align="center">

**Built with ❤️ for better healthcare access**

[🌐 Repository](https://github.com/AADHIIII/ArogyaMitra1) • [📱 Demo](http://localhost:3011) • [📧 Contact](mailto:hello@arogyamitra.com)

**⭐ Star this repository if you found it helpful!**

</div>