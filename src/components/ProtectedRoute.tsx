import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute - Guards routes that require authentication.
 * 
 * If no user is logged in, redirects to /login with the intended
 * destination preserved in location state so the user can be
 * redirected back after successful login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { state } = useApp();
  const location = useLocation();

  if (!state.user) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
