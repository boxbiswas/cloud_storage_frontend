import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Using an object to store uploads by ID for O(1) updates
  uploads: {},
  isTrayOpen: false,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addUpload: (state, action) => {
      const { id, fileName, size, folderId } = action.payload;
      state.uploads[id] = {
        id,
        fileName,
        size,
        folderId,
        progress: 0,
        status: 'queued', // queued | uploading | completed | failed | cancelled
        error: null,
      };
      state.isTrayOpen = true; // Auto-open tray when a new upload starts
    },
    setUploadStatus: (state, action) => {
      const { id, status, error, progress } = action.payload;
      if (state.uploads[id]) {
        if (status !== undefined) state.uploads[id].status = status;
        if (error !== undefined) state.uploads[id].error = error;
        if (progress !== undefined) state.uploads[id].progress = progress;
      }
    },
    updateUploadProgress: (state, action) => {
      const { id, progress } = action.payload;
      if (state.uploads[id]) {
        state.uploads[id].progress = progress;
        state.uploads[id].status = 'uploading';
      }
    },
    removeUpload: (state, action) => {
      const { id } = action.payload;
      delete state.uploads[id];
      if (Object.keys(state.uploads).length === 0) {
        state.isTrayOpen = false;
      }
    },
    toggleTray: (state) => {
      state.isTrayOpen = !state.isTrayOpen;
    },
    clearCompleted: (state) => {
      Object.keys(state.uploads).forEach((id) => {
        if (state.uploads[id].status === 'completed' || state.uploads[id].status === 'cancelled') {
          delete state.uploads[id];
        }
      });
      if (Object.keys(state.uploads).length === 0) {
        state.isTrayOpen = false;
      }
    }
  },
});

export const {
  addUpload,
  setUploadStatus,
  updateUploadProgress,
  removeUpload,
  toggleTray,
  clearCompleted,
} = uploadSlice.actions;

export default uploadSlice.reducer;
