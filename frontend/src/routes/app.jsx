/*
 * Carbon & Crimson IMS
 * File: src/routes/app.jsx
 * Version: 1.0.1
 * Purpose: App router with protected routes.
 */
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from '../state/auth_context';
import { ProtectedRoute } from './protected_route';
import { LoginPage } from '../views/login_page';
import { ResetPasswordPage } from '../views/reset_password_page';
import { DashboardPage } from '../views/dashboard_page';

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}