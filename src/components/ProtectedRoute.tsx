import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Authentication disabled - all routes are accessible
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute;
