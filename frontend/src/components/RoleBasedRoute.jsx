import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthChecked, selectLoggedInUser } from '../features/auth/AuthSlice';
import { Box, CircularProgress } from '@mui/material';

export const RoleBasedRoute = ({ allowedRoles, requireApproval = false }) => {
  const loggedInUser = useSelector(selectLoggedInUser);
  const isAuthChecked = useSelector(selectIsAuthChecked);

  // Show loading while checking authentication
  if (!isAuthChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is not logged in, redirect to login
  if (!loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has one of the allowed roles
  const hasAllowedRole = allowedRoles.includes(loggedInUser.role);

  // For vendor routes that require approval, check if vendor is approved
  if (requireApproval && loggedInUser.role === 'vendor' && !loggedInUser.isApproved) {
    return <Navigate to="/vendor/pending-approval" replace />;
  }

  // If user has allowed role, render the protected content
  if (hasAllowedRole) {
    return <Outlet />;
  }

  // If user doesn't have allowed role, redirect to home
  return <Navigate to="/" replace />;
};

export default RoleBasedRoute;