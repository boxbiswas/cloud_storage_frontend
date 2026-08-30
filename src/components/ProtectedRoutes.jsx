import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { useCheckAuthQuery } from '../redux/api/authApi';
import { setCredentials } from '../redux/slices/authSlice';

export default function ProtectedRoute() {
  const dispatch = useDispatch();
  
  // RTK Query will hit /auth/me automatically
  const { data, isLoading, isError, isSuccess } = useCheckAuthQuery();

  useEffect(() => {
    // If successful, push user data to the standard Redux store for 
    // easy synchronous access (e.g., in the Sidebar)
    if (isSuccess && data?.user) {
      dispatch(setCredentials({ user: data.user }));
    }
  }, [isSuccess, data, dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cloud-50">
        <Loader2 className="animate-spin text-azure-500" size={40} />
      </div>
    );
  }

  // If the query fails (e.g., 401), redirect to login
  if (isError) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}