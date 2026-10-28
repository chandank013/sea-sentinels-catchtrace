import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Batches from './pages/Batches';
import NewBatch from './pages/NewBatch';
import BatchDetails from './pages/BatchDetails';
import AddEvent from './pages/AddEvent';
import ScanQR from './pages/ScanQR';
import PublicTrace from './pages/PublicTrace';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0B2545',
                color: '#FFFFFF',
                fontSize: '13px',
                borderRadius: '10px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#16A34A',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#DC2626',
                  secondary: '#FFFFFF',
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/trace/:id" element={<PublicTrace />} />
            <Route path="/scan" element={<ScanQR />} />

            {/* Authenticated Routes - STRICTLY NO SIDEBAR */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/batches"
              element={
                <ProtectedRoute>
                  <Batches />
                </ProtectedRoute>
              }
            />

            <Route
              path="/batches/new"
              element={
                <ProtectedRoute allowedRoles={['FISHER', 'ADMIN']}>
                  <NewBatch />
                </ProtectedRoute>
              }
            />

            <Route
              path="/batches/:id"
              element={
                <ProtectedRoute>
                  <BatchDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/batches/:id/add-event"
              element={
                <ProtectedRoute>
                  <AddEvent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-event"
              element={
                <ProtectedRoute>
                  <AddEvent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/alerts"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Alerts />
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
