import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from '../slices/authSlice';

// Create our baseQuery instance
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  // Ensure credentials (cookies) are sent with every request
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Wrap baseQuery to intercept 401s and automatically log the user out
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If we get a 401 Unauthorized, dispatch the logout action
  // EXCEPT for public link endpoints which return 401 when password is required/incorrect
  if (result.error && result.error.status === 401 && !args.url?.startsWith('/link/')) {
    // Prevent redirect loop if already on login
    if (window.location.pathname !== '/login') {
      api.dispatch(logout());
      sessionStorage.removeItem('sessionid');
      window.location.href = '/login';
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // Define tag types for automated cache invalidation
  tagTypes: ['Auth', 'Folder', 'File', 'Share', 'Search', 'Star', 'Trash'],
  endpoints: () => ({}),
});
