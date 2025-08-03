import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Loading from './Loading';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Student trying to access coach routes
    if (user.role === 'student' && location.pathname.startsWith('/coach')) {
      return <Navigate to="/dashboard" replace />;
    }
    // Coach trying to access student routes (except profile which is shared)
    if (user.role === 'coach' && !location.pathname.startsWith('/coach') && location.pathname !== '/profile') {
      return <Navigate to="/coach/dashboard" replace />;
    }
    // For other cases, redirect to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;