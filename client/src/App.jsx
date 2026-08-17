import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import SplashScreen from './components/common/SplashScreen';
import PwaInstallPrompt from './components/common/PwaInstallPrompt';

import HomeLanding from './pages/HomeLanding';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MedicinesList from './pages/MedicinesList';
import AddMedicine from './pages/AddMedicine';
import EditMedicine from './pages/EditMedicine';
import CalendarPage from './pages/CalendarPage';
import HistoryPage from './pages/HistoryPage';
import ExportPage from './pages/ExportPage';
import NotificationsPage from './pages/NotificationsPage';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
          <Router>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: '16px',
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: '13px',
                },
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeLanding />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected SaaS Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/medicines" element={<MedicinesList />} />
                <Route path="/add-medicine" element={<AddMedicine />} />
                <Route path="/edit-medicine/:id" element={<EditMedicine />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* PWA Install App Prompt Banner */}
            <PwaInstallPrompt />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
