import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uploadReducer from './slices/uploadSlice';
import driveReducer from './slices/driveSlice';
import { baseApi } from './api/baseApi';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        upload: uploadReducer,
        drive: driveReducer,
        [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});