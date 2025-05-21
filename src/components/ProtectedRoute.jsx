import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAuthenticated, user, allowedRoles, toast }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, but user profile is not yet loaded (user is null), 
  // or if it's a guest user, we still render children.
  // The child components (e.g., Dashboard) are responsible for handling
  // scenarios like missing household_id or guest-specific UI.
  // Role-based access for non-guest users is checked below.
  
  if (user && user.role !== 'guest') { // Only apply role checks if user profile exists and is not a guest
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to access this page.",
      });
      return <Navigate to="/" replace />;
    }
  } else if (user && user.role === 'guest') {
    // For guest users, check if 'guest' is an allowed role for the route
    if (allowedRoles && !allowedRoles.includes('guest')) {
      // If guest is not allowed, redirect them to the main page (dashboard, which handles guest view)
      // This prevents guests from accessing non-guest routes directly via URL
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Guests cannot access this page.",
      });
      return <Navigate to="/" replace />;
    }
  }
  // If user is null (profile still loading or failed to load for an authenticated user),
  // we let them through. The page component (e.g., Dashboard) should handle this state,
  // possibly showing a loading indicator for the profile or an error message.
  // Redirecting to /login here would be wrong if they have a valid session.

  return children;
};

export default ProtectedRoute;