import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('hms_token');
  const userRole = localStorage.getItem('hms_user_role') || ''; // Add logic to set this on login

  // If there's no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't match, redirect to their proper dashboard
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Route them based on their role
    switch (userRole) {
      case 'Super Admin':
      case 'Hospital Admin':
        return <Navigate to="/dashboard/admin" replace />;
      case 'Doctor':
        return <Navigate to="/dashboard/doctor" replace />;
      case 'Nurse':
        return <Navigate to="/dashboard/nurse" replace />;
      case 'Receptionist':
        return <Navigate to="/dashboard/receptionist" replace />;
      case 'Lab Technician':
        return <Navigate to="/dashboard/lab" replace />;
      case 'Pharmacist':
        return <Navigate to="/dashboard/pharmacy" replace />;
      case 'Billing Executive':
        return <Navigate to="/dashboard/billing" replace />;
      default:
        return <Navigate to="/dashboard/patient" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
