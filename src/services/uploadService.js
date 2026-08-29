import axios from 'axios';
import api from '../https/axios';
import { store } from '../redux/store';
import {
  addUpload,
  updateUploadProgress,
  setUploadSuccess,
  setUploadError,
} from '../redux/slices/uploadSlice';

// We keep actual File objects here so they don't go into Redux (which expects serializable data)
export const activeFiles = new Map();

export const uploadFile = async (file, folderId = null) => {
  const id = crypto.randomUUID();
  
  // 1. Add to Redux and Map
  store.dispatch(addUpload({ id, name: file.name, size: file.size }));
  activeFiles.set(id, file);

  try {
    // 2. Init Upload
    const initRes = await api.post('/files/init', {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      folderId,
    });

    const { fileId, uploadUrl } = initRes.data;

    // 3. Upload to Supabase directly
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        store.dispatch(updateUploadProgress({ id, progress: percentCompleted }));
      },
    });

    // 4. Complete Upload
    await api.post('/files/complete', {
      fileId,
    });

    store.dispatch(setUploadSuccess({ id }));
    activeFiles.delete(id); // Clean up
  } catch (error) {
    console.error('Upload failed:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Upload failed';
    store.dispatch(setUploadError({ id, error: errorMessage }));
    // We keep it in activeFiles in case we want to implement a retry mechanism later!
  }
};
