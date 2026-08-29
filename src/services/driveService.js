/**
 * driveService.js
 * All API calls for the Drive (folders, files CRUD).
 * Uses the shared axios instance which handles auth cookies and 401 redirects.
 */
import api from '../https/axios';

// ─── FOLDER ENDPOINTS ────────────────────────────────────────────────────────

/**
 * Fetch the contents of a folder.
 * Pass null or undefined for folderId to get the root (My Drive) contents.
 * Backend: GET /folders/:id  or  GET /folders/root
 */
export const fetchFolderContents = async (folderId) => {
  const url = folderId ? `/folders/${folderId}` : '/folders/root';
  const res = await api.get(url);
  return res.data; // { folder, breadcrumbs, children: { folders, files } }
};

/**
 * Create a new folder inside the given parent (null = root).
 * Backend: POST /folders
 */
export const createFolderApi = async ({ name, parentId }) => {
  const res = await api.post('/folders', { name, parentId: parentId ?? null });
  return res.data.folder;
};

/**
 * Rename a folder.
 * Backend: PATCH /folders/:id
 */
export const renameFolderApi = async (folderId, name) => {
  const res = await api.patch(`/folders/${folderId}`, { name });
  return res.data.folder;
};

/**
 * Move a folder to a new parent.
 * Backend: PATCH /folders/:id
 */
export const moveFolderApi = async (folderId, parentId) => {
  const res = await api.patch(`/folders/${folderId}`, { parentId: parentId ?? null });
  return res.data.folder;
};

/**
 * Soft-delete a folder (moves to trash).
 * Backend: DELETE /folders/:id
 */
export const deleteFolderApi = async (folderId) => {
  await api.delete(`/folders/${folderId}`);
};

// ─── FILE ENDPOINTS ───────────────────────────────────────────────────────────

/**
 * Rename a file.
 * Backend: PATCH /files/:id
 */
export const renameFileApi = async (fileId, name) => {
  const res = await api.patch(`/files/${fileId}`, { name });
  return res.data.file;
};

/**
 * Move a file to a new folder.
 * Backend: PATCH /files/:id
 */
export const moveFileApi = async (fileId, folderId) => {
  const res = await api.patch(`/files/${fileId}`, { folderId: folderId ?? null });
  return res.data.file;
};

/**
 * Soft-delete a file.
 * Backend: DELETE /files/:id
 */
export const deleteFileApi = async (fileId) => {
  await api.delete(`/files/${fileId}`);
};
