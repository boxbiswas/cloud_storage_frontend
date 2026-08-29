import { createSlice } from '@reduxjs/toolkit';

/**
 * driveSlice - Manages the state of the file browser (My Drive page).
 *
 * State shape:
 *   currentFolderId  - null means root ("My Drive")
 *   breadcrumbs      - Array of { id, name } for the current path
 *   folders          - Array of folder objects in the current view
 *   files            - Array of file objects in the current view
 *   viewMode         - 'grid' | 'list'
 *   sortBy           - 'name' | 'createdAt' | 'size'
 *   sortDir          - 'asc' | 'desc'
 *   loading          - true while fetching folder contents
 *   error            - error string or null
 *   selectedIds      - Set of selected item IDs (stored as array for Redux serializability)
 *   contextMenu      - { x, y, item, type } | null — what right-click menu is open
 */
const initialState = {
  currentFolderId: null,       // null = root
  breadcrumbs: [],             // [{ id, name }, ...]
  folders: [],
  files: [],
  viewMode: 'grid',            // 'grid' | 'list'
  sortBy: 'name',              // 'name' | 'createdAt' | 'size'
  sortDir: 'asc',
  loading: false,
  error: null,
  selectedIds: [],             // Array of selected item IDs
  contextMenu: null,           // { x, y, item, itemType } | null
};

const driveSlice = createSlice({
  name: 'drive',
  initialState,
  reducers: {
    // --- Navigation ---

    /** Called when the user navigates into a folder (or back to root) */
    setCurrentFolder: (state, action) => {
      state.currentFolderId = action.payload; // null = root
      state.selectedIds = [];
      state.contextMenu = null;
      state.error = null;
    },

    // --- Folder Contents Loading ---

    /** Set loading state while fetching folder data from the API */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    /** Populate state after a successful GET /folders/:id (or root) response */
    setFolderContents: (state, action) => {
      const { breadcrumbs, folders, files } = action.payload;
      state.breadcrumbs = breadcrumbs;
      state.folders = folders;
      state.files = files;
      state.loading = false;
      state.error = null;
    },

    /** Set an error message if fetching fails */
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // --- CRUD Optimistic Updates ---

    /** Add a newly created folder to the current view without a full refetch */
    addFolder: (state, action) => {
      state.folders.unshift(action.payload);
    },

    /** Update a folder's name/parentId in place after a successful PATCH */
    updateFolder: (state, action) => {
      const { id, changes } = action.payload;
      const idx = state.folders.findIndex(f => f.id === id);
      if (idx !== -1) {
        state.folders[idx] = { ...state.folders[idx], ...changes };
      }
    },

    /** Remove a folder from the current view after a successful DELETE */
    removeFolder: (state, action) => {
      state.folders = state.folders.filter(f => f.id !== action.payload);
    },

    /** Update a file's metadata in place */
    updateFile: (state, action) => {
      const { id, changes } = action.payload;
      const idx = state.files.findIndex(f => f.id === id);
      if (idx !== -1) {
        state.files[idx] = { ...state.files[idx], ...changes };
      }
    },

    /** Remove a file from the current view */
    removeFile: (state, action) => {
      state.files = state.files.filter(f => f.id !== action.payload);
    },

    /** Add a newly uploaded file (called by uploadService after /files/complete) */
    addFile: (state, action) => {
      // Only add if we're in the correct folder context
      state.files.unshift(action.payload);
    },

    // --- View Mode & Sorting ---

    setViewMode: (state, action) => {
      state.viewMode = action.payload; // 'grid' | 'list'
    },

    setSortBy: (state, action) => {
      if (state.sortBy === action.payload) {
        // Toggle direction if same column clicked
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = action.payload;
        state.sortDir = 'asc';
      }
    },

    // --- Selection ---

    /** Toggle a single item in the selection */
    toggleSelected: (state, action) => {
      const id = action.payload;
      const idx = state.selectedIds.indexOf(id);
      if (idx === -1) {
        state.selectedIds.push(id);
      } else {
        state.selectedIds.splice(idx, 1);
      }
    },

    /** Clear all selected items */
    clearSelection: (state) => {
      state.selectedIds = [];
    },

    // --- Context Menu ---

    /** Open context menu at (x, y) for a specific item */
    openContextMenu: (state, action) => {
      state.contextMenu = action.payload; // { x, y, item, itemType }
    },

    /** Close the context menu */
    closeContextMenu: (state) => {
      state.contextMenu = null;
    },
  },
});

export const {
  setCurrentFolder,
  setLoading,
  setFolderContents,
  setError,
  addFolder,
  updateFolder,
  removeFolder,
  updateFile,
  removeFile,
  addFile,
  setViewMode,
  setSortBy,
  toggleSelected,
  clearSelection,
  openContextMenu,
  closeContextMenu,
} = driveSlice.actions;

export default driveSlice.reducer;
