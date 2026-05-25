import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  if (!token || !userString) {
    // User is not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userString);

    if (allowedRole && user.role !== allowedRole) {
      // User is logged in but doesn't have the correct role for this dashboard
      // Redirect them to their appropriate dashboard
      if (user.role === 'manager') {
        return <Navigate to="/manager-dashboard" replace />;
      } else {
        return <Navigate to="/member-dashboard" replace />;
      }
    }
  } catch (error) {
    // Parsing error or invalid data, clear localStorage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
