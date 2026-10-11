import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFairwork } from '../../context/FairworkContext';
import { UserRole } from '../../types/fairwork';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { currentUser } = useFairwork();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // If user's role is not allowed, redirect to app root dashboard
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
