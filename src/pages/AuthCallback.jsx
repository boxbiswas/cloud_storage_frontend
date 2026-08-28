import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import api from '../https/axios';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      // Assuming token is passed in hash or query string
      const params = new URLSearchParams(location.hash.substring(1) || location.search);
      const idToken = params.get('id_token') || params.get('credential'); // Depending on the google login method

      if (idToken) {
        try {
          const response = await api.post('/auth/google', { idToken });
          
          dispatch(setCredentials({ user: response.data.user }));
          
          if (response.data.token) sessionStorage.setItem('sessionid', response.data.token);
          else sessionStorage.setItem('sessionid', 'true');

          toast.success('Successfully logged in with Google');
          navigate('/');
        } catch (err) {
          toast.error('Google authentication failed');
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleGoogleAuth();
  }, [location, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
       <div className="text-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azure-500 mx-auto mb-4"></div>
         <p className="font-body text-sm text-slate-500">Completing authentication...</p>
       </div>
    </div>
  );
};

export default AuthCallback;
