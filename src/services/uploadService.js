import axios from 'axios';
import { store } from '../redux/store';
import { addUpload, setUploadStatus, updateUploadProgress } from '../redux/slices/uploadSlice';
import { folderApi } from '../redux/api/folderApi';
import toast from 'react-hot-toast';

// We'll create a dedicated axios instance for uploads just to pick up base configuration
// But we won't create a general API layer.
const uploadClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Add a request interceptor to attach the session token
uploadClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('sessionid');
  if (token && token !== 'true') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Non-serializable state tracker (maps uploadId to the File object and AbortController)
const activeUploads = new Map();

/**
 * Generates a random UUID (fallback for browsers without crypto.randomUUID)
 */
const generateId = () => {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15);
};

/**
 * Start an upload for a given File object
 */
export const uploadFile = async (file, folderId) => {
  const id = generateId();
  const controller = new AbortController();
  
  // Keep track of the raw file and abort controller
  activeUploads.set(id, { file, folderId, controller });

  // Initialize Redux state
  store.dispatch(addUpload({
    id,
    fileName: file.name,
    size: file.size,
    folderId,
  }));

  await executeUpload(id);
};

/**
 * Retry an upload that failed
 */
export const retryUpload = async (id) => {
  const record = activeUploads.get(id);
  if (!record) {
    toast.error('Cannot retry: file data lost');
    return;
  }
  
  // Create a fresh controller for the retry
  record.controller = new AbortController();
  
  store.dispatch(setUploadStatus({ id, status: 'queued', error: null, progress: 0 }));
  await executeUpload(id);
};

/**
 * Cancel an ongoing upload
 */
export const cancelUpload = (id) => {
  const record = activeUploads.get(id);
  if (record && record.controller) {
    record.controller.abort();
  }
  store.dispatch(setUploadStatus({ id, status: 'cancelled' }));
  activeUploads.delete(id);
};

/**
 * Core upload orchestration (init -> upload -> complete)
 */
const executeUpload = async (id) => {
  const record = activeUploads.get(id);
  if (!record) return;

  const { file, folderId, controller } = record;

  try {
    store.dispatch(setUploadStatus({ id, status: 'uploading' }));

    // 1. INIT
    // The backend might return a presigned URL or expect multipart/form-data directly.
    // Assuming the PDF asks for an init step, we hit /api/files/init
    const initRes = await uploadClient.post('/files/init', {
      filename: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      folderId: folderId
    }, {
      signal: controller.signal
    });

    // We assume initRes.data gives us some upload instructions (e.g. uploadUrl or fileId)
    // For this generic MVP, if there is no uploadUrl, we'll post directly to a backend endpoint.
    const uploadUrl = initRes.data?.uploadUrl || '/files/upload';
    const serverFileId = initRes.data?.fileId || null;

    // 2. UPLOAD
    // Use FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);
    if (serverFileId) formData.append('fileId', serverFileId);

    // If uploadUrl is an absolute URL (like an S3 presigned URL), use standard fetch/axios to it
    // If it's a relative URL, use our uploadClient
    const isAbsolute = uploadUrl.startsWith('http');
    const uploadReqConfig = {
      signal: controller.signal,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        store.dispatch(updateUploadProgress({ id, progress: percentCompleted }));
      }
    };

    if (isAbsolute) {
      // Put directly to presigned URL (S3 doesn't want multipart FormData for presigned PUT, it wants raw file)
      // We will adjust based on what backend expects. We'll use raw file if absolute (assuming S3 presigned).
      await axios.put(uploadUrl, file, {
        ...uploadReqConfig,
        headers: { 'Content-Type': file.type || 'application/octet-stream' }
      });
    } else {
      // Relative multipart upload to our Express backend
      await uploadClient.post(uploadUrl, formData, {
        ...uploadReqConfig,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    // 3. COMPLETE
    // Tell the backend it finished successfully
    if (serverFileId) {
      await uploadClient.post('/files/complete', { fileId: serverFileId }, {
        signal: controller.signal
      });
    }

    // Success! Update Redux
    store.dispatch(setUploadStatus({ id, status: 'completed', progress: 100 }));
    
    // Invalidate Folder cache to trigger UI refresh automatically!
    if (folderId) {
      store.dispatch(folderApi.util.invalidateTags([{ type: 'Folder', id: folderId }]));
    } else {
      store.dispatch(folderApi.util.invalidateTags([{ type: 'Folder', id: 'root' }]));
    }

  } catch (err) {
    if (axios.isCancel(err)) {
      console.log('Upload cancelled', id);
      store.dispatch(setUploadStatus({ id, status: 'cancelled' }));
    } else {
      console.error('Upload failed', err);
      store.dispatch(setUploadStatus({ 
        id, 
        status: 'failed', 
        error: err.response?.data?.message || err.message || 'Upload failed' 
      }));
    }
  } finally {
    // Only cleanup from activeUploads if it succeeded or was cancelled? 
    // We keep it in activeUploads if it failed so we can Retry it!
    const currentStatus = store.getState().upload.uploads[id]?.status;
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      activeUploads.delete(id);
    }
  }
};
