import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute() {
  // Check if the user is authenticated via Redux state
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  // Check if a session token exists and is not a string representation of null/undefined
  const token = sessionStorage.getItem('sessionid');
  const hasValidToken = token && token !== 'undefined' && token !== 'null';

  // If the user is neither authenticated in state nor has a valid token, redirect to login
  if (!isAuthenticated && !hasValidToken) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (Outlet)
  return <Outlet />;
}