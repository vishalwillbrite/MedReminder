# MedReminder 💊 — Production Medication Management & Web Push Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=flat&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Local%2FAtlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=flat&logo=pwa)](https://web.dev/progressive-web-apps/)

**MedReminder** is a full-stack, production-grade Progressive Web Application (PWA) designed for healthcare medication scheduling, adherence tracking, and real-time VAPID Web Push notifications.

---

## 🌟 Key Features

- **🔐 Robust JWT Authentication**: Secure user registration (`POST /api/auth/register`) with email normalization, password hashing (`bcryptjs`), and HTTP 409 duplicate user handling.
- **💊 Comprehensive Prescription Engine**: Manage medicines with custom dosages, multiple alarm times per day, food conditions (*Before/After/With Food*), categories, and doctor notes.
- **⏱ Minute-Level Cron Scheduler**: Background `node-cron` engine running every minute to evaluate active prescriptions, dispatch push alerts, detect missed doses (30-min grace period), and send daily morning summaries.
- **🔔 Real Web Push Notifications**: Browser-native VAPID push notification system powered by `web-push` and custom Service Workers (`sw.js`). Supports inline push actions (**Take Dose**, **Snooze 10m**, **Dismiss**).
- **📊 Interactive Dashboard & Adherence Analytics**: Visual adherence rate percentage, dose distribution pie charts, weekly adherence trends, today's schedule timeline, and active streak counters.
- **📅 Interactive Medication Calendar**: Month, Week, and Day views displaying scheduled, completed, missed, and snoozed doses.
- **📜 Filterable Adherence History**: Audit log table with date range filtering, medicine search, and status filters.
- **📄 Clinical PDF & CSV Export Hub**: Generate formal PDF medical prescription reports using `jspdf` & `jspdf-autotable` with logo branding, patient details, and CSV data downloads.
- **📱 PWA & Offline Support**: Fully installable PWA manifest with offline fallback page, custom app icons, and splash screen.
- **🌙 Full Dark Mode Support**: Sleek, accessible UI built with Tailwind CSS and dark mode theme persistence.

---

## 🏗 System Architecture

```
[ Client Browser (React 18 + Vite) ] 
       │ 
       ├── Service Worker (sw.js) ──► OS Web Push Notifications
       │ 
       ▼ (Axios + JWT Auth Header)
[ Express.js REST API Server (Port 5000) ]
       │
       ├── Rate Limiter & Helmet Middleware
       ├── node-cron Engine (Runs every 60s)
       ├── pushNotificationService (web-push VAPID)
       │
       ▼
[ MongoDB Database (medreminder) ]
       ├── users
       ├── medicines
       ├── reminders
       ├── notifications
       ├── pushsubscriptions
       └── activitylogs
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017/medreminder` or MongoDB Atlas URI.

### 2. Installation & Setup

Clone the repository and install root dependencies:
```bash
git clone https://github.com/your-username/Med-reminder.git
cd Med-reminder

# Install server dependencies
npm install --prefix server

# Install client dependencies
npm install --prefix client
```

### 3. Environment Variables Setup

Create a `server/.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/medreminder
JWT_SECRET=medreminder_super_secret_jwt_key_2026_production
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# VAPID Web Push Credentials
VAPID_PUBLIC_KEY=BIaKie77QwIdVajEVHaxStDEWLhXNittlIKO6Vyt98tMI1rTd9yJeq2cJH8OJGkes8KNkL9YjFSxTGmAg7MhZoU
VAPID_PRIVATE_KEY=pYNNzGcwvsfiEOtBPJRbk3sq3A3Y-fYQaQCQqEUv37g
VAPID_EMAIL=mailto:your-email@example.com
```

To generate your own VAPID keys:
```bash
npx web-push generate-vapid-keys
```

---

## 💻 Running the Application Locally

Start both server and client concurrently:

```bash
# Start Express Backend (Port 5000)
npm run server

# Start Vite Frontend (Port 5173)
npm run client
```

Navigate to `http://localhost:5173` in your browser.

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | Public |
| `GET` | `/api/medicine` | Get user's medicines | Private |
| `POST` | `/api/medicine` | Add new medicine prescription | Private |
| `PUT` | `/api/medicine/:id` | Update medicine | Private |
| `DELETE` | `/api/medicine/:id` | Delete medicine | Private |
| `GET` | `/api/reminders/today` | Fetch today's scheduled doses | Private |
| `POST` | `/api/reminders/:id/snooze` | Snooze reminder by 10/30/60m | Private |
| `POST` | `/api/notifications/subscribe` | Register browser push endpoint | Private |
| `GET` | `/api/notifications` | Get notification history | Private |

---

## 🧪 Testing Web Push Notifications

1. Log in to MedReminder at `http://localhost:5173`.
2. On the **Dashboard**, click **"Enable Notifications"** and click **Allow** on browser permission prompt.
3. Go to **Add Medicine** and create a prescription.
4. Set the alarm time **1 minute in the future** (e.g. if current time is `17:35`, set alarm to `17:36`).
5. Observe the backend cron logs — an OS Web Push notification will trigger automatically with inline **[Taken]** and **[Snooze 10m]** action buttons!

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
