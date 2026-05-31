import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OTPPage from './pages/OTPPage'
import HomePage from './pages/HomePage'
import PostRequestPage from './pages/PostRequestPage'
import RequestDetailPage from './pages/RequestDetailPage'
import MyRequestsPage from './pages/MyRequestsPage'
import ProfilePage from './pages/ProfilePage'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPPage />} />

          {/* Protected routes */}
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

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)