import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OTPPage from './pages/OTPPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import HomePage from './pages/HomePage'
import PostRequestPage from './pages/PostRequestPage'
import RequestDetailPage from './pages/RequestDetailPage'
import MyRequestsPage from './pages/MyRequestsPage'
import ProfilePage from './pages/ProfilePage'

// Request notification permission
if ('Notification' in window) {
  Notification.requestPermission();
}

// Register the PWA service worker (production only, to avoid dev caching)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<OTPPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/home" element={
              <ProtectedRoute><HomePage /></ProtectedRoute>
            } />
            <Route path="/post-request" element={
              <ProtectedRoute><PostRequestPage /></ProtectedRoute>
            } />
            <Route path="/requests/:id" element={
              <ProtectedRoute><RequestDetailPage /></ProtectedRoute>
            } />
            <Route path="/my-requests" element={
              <ProtectedRoute><MyRequestsPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)