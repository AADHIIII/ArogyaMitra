# 🏥 ArogyaMitra Healthcare Platform

<div align="center">
  <img width="819" alt="ArogyaMitra Dashboard" src="https://github.com/user-attachments/assets/16b967dd-e5d1-4f2d-aa39-6871e733278b" />
  <p><em>Complete Full-Stack Healthcare Management System connecting patients with healthcare providers.</em></p>
</div>

---

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Overview

ArogyaMitra is a comprehensive healthcare platform designed to streamline the interaction between patients and doctors. It provides a robust suite of tools for appointment scheduling, medication tracking, secure communication, and health record management.

## ✨ Key Features

### 👥 For Patients
- 🔍 **Smart Discovery**: Find doctors by specialty, location, or rating.
- 📅 **Easy Booking**: Real-time availability and instant appointment scheduling.
- 💊 **Medication Tracker**: Never miss a dose with prescription tracking and reminders.
- 💬 **Direct Messaging**: Secure, encrypted chat with your healthcare providers.
- 📊 **Health Insights**: Personal dashboard with health statistics and records.

### 👨‍⚕️ For Doctors
- 📋 **Practice Management**: Organize patient records and consultation history.
- 🗓️ **Smart Scheduler**: Manage availability, buffer times, and appointment slots.
- 📝 **Digital Prescriptions**: Generate and share prescriptions instantly.
- 📈 **Analytics**: Track patient growth and practice performance.
- 🔔 **Instant Alerts**: Get notified about new bookings and messages.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18.0 or higher
- **PostgreSQL**: Local instance or Supabase
- **npm**: v8.0 or higher

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/AADHIIII/ArogyaMitra.git
cd ArogyaMitra

# Install all dependencies (Root, Frontend, Backend)
npm run setup
```

### 2. Configuration
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/arogyamitra"
JWT_SECRET="your_secret_key"
PORT=3010
```

### 3. Database Setup
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Running the App
```bash
# From the root directory
npm run dev
```
- **Frontend**: `http://localhost:3011`
- **Backend API**: `http://localhost:3010`

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Radix UI
- **State**: Zustand (Lightweight & Fast)
- **Validation**: Zod + React Hook Form

### Backend Stack
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT with HTTP-only cookies

---

## 📊 API Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/login` | `POST` | User authentication |
| `/api/doctors/search` | `GET` | Filter & find doctors |
| `/api/appointments/book` | `POST` | Schedule an appointment |
| `/api/prescriptions` | `GET` | View patient medications |
| `/api/messages` | `POST` | Send secure message |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  Built with ❤️ for a healthier world.
</div>
