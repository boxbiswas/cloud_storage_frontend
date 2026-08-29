import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uploads: [], // { id, name, size, progress, status: 'PENDING' | 'UPLOADING' | 'SUCCESS' | 'ERROR', error: string | null }
  isTrayOpen: false,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addUpload: (state, action) => {
      const { id, name, size } = action.payload;
      state.uploads.unshift({
        id,
        name,
        size,
        progress: 0,
        status: 'PENDING',
        error: null,
      });
      state.isTrayOpen = true; // Auto-open tray when a new upload starts
    },
    updateUploadProgress: (state, action) => {
      const { id, progress } = action.payload;
      const upload = state.uploads.find((u) => u.id === id);
      if (upload) {
        upload.progress = progress;
        upload.status = 'UPLOADING';
      }
    },
    setUploadSuccess: (state, action) => {
      const { id } = action.payload;
      const upload = state.uploads.find((u) => u.id === id);
      if (upload) {
        upload.progress = 100;
        upload.status = 'SUCCESS';
      }
    },
    setUploadError: (state, action) => {
      const { id, error } = action.payload;
      const upload = state.uploads.find((u) => u.id === id);
      if (upload) {
        upload.status = 'ERROR';
        upload.error = error;
      }
    },
    removeUpload: (state, action) => {
      const { id } = action.payload;
      state.uploads = state.uploads.filter((u) => u.id !== id);
      if (state.uploads.length === 0) {
        state.isTrayOpen = false;
      }
    },
    toggleTray: (state) => {
      state.isTrayOpen = !state.isTrayOpen;
    },
    clearCompleted: (state) => {
      state.uploads = state.uploads.filter((u) => u.status !== 'SUCCESS');
      if (state.uploads.length === 0) {
        state.isTrayOpen = false;
      }
    }
  },
});

export const {
  addUpload,
  updateUploadProgress,
  setUploadSuccess,
  setUploadError,
  removeUpload,
  toggleTray,
  clearCompleted,
} = uploadSlice.actions;

export default uploadSlice.reducer;
