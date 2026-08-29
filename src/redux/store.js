import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uploadReducer from './slices/uploadSlice';
import driveReducer from './slices/driveSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        upload: uploadReducer,
        drive: driveReducer,
    },
});