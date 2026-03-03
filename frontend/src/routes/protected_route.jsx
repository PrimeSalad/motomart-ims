/*
 * Carbon & Crimson IMS
 * File: src/routes/protected_route.jsx
 * Version: 1.0.0
 * Purpose: Protected routes using auth token.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/auth_context';

export function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
