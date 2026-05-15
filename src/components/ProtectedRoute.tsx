import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useMedicAuth } from '../hooks/useMedicAuth';
import { shouldRefreshToken, isAuthenticated as checkTokenValid } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, logout } = useMedicAuth();

  // Check token expiration and attempt refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    // If token is fully expired, force logout
    if (!checkTokenValid()) {
      logout();
      return;
    }

    // If token is expiring soon, attempt refresh
    if (shouldRefreshToken()) {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const apiUrl = window.location.origin;
      fetch(`${apiUrl}/functions/v1/verify-token`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
          }
        })
        .catch(() => { /* silent - will retry next navigation */ });
    }
  }, [isAuthenticated, logout]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
