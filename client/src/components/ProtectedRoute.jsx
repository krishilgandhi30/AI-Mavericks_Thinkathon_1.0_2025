import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = auth.isAuthenticated();
  const isTokenExpired = auth.isTokenExpired();

  if (!isAuthenticated || isTokenExpired) {
    // Clear expired token
    if (isTokenExpired) {
      auth.logout();
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
