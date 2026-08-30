import { createSlice } from '@reduxjs/toolkit';

/**
 * driveSlice - Manages the LOCAL UI state of the file browser (My Drive page).
 * Data fetching state (folders, files, loading, error) is now handled by RTK Query.
 *
 * State shape:
 *   currentFolderId  - null means root ("My Drive")
 *   viewMode         - 'grid' | 'list'
 *   sortBy           - 'name' | 'createdAt' | 'size'
 *   sortDir          - 'asc' | 'desc'
 *   selectedIds      - Array of selected item IDs
 *   contextMenu      - { x, y, item, itemType } | null — what right-click menu is open
 */
const initialState = {
  currentFolderId: null,       // null = root
  viewMode: 'grid',            // 'grid' | 'list'
  sortBy: 'name',              // 'name' | 'createdAt' | 'size'
  sortDir: 'asc',
  selectedIds: [],             // Array of selected item IDs
  contextMenu: null,           // { x, y, item, itemType } | null
};

const driveSlice = createSlice({
  name: 'drive',
  initialState,
  reducers: {
    // --- Navigation ---
    setCurrentFolder: (state, action) => {
      state.currentFolderId = action.payload; // null = root
      state.selectedIds = [];
      state.contextMenu = null;
    },

    // --- View Mode & Sorting ---
    setViewMode: (state, action) => {
      state.viewMode = action.payload; // 'grid' | 'list'
    },

    setSortBy: (state, action) => {
      if (state.sortBy === action.payload) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortBy = action.payload;
        state.sortDir = 'asc';
      }
    },

    // --- Selection ---
    toggleSelected: (state, action) => {
      const id = action.payload;
      const idx = state.selectedIds.indexOf(id);
      if (idx === -1) {
        state.selectedIds.push(id);
      } else {
        state.selectedIds.splice(idx, 1);
      }
    },

    clearSelection: (state) => {
      state.selectedIds = [];
    },

    // --- Context Menu ---
    openContextMenu: (state, action) => {
      state.contextMenu = action.payload; // { x, y, item, itemType }
    },

    closeContextMenu: (state) => {
      state.contextMenu = null;
    },
  },
});

export const {
  setCurrentFolder,
  setViewMode,
  setSortBy,
  toggleSelected,
  clearSelection,
  openContextMenu,
  closeContextMenu,
} = driveSlice.actions;

export default driveSlice.reducer;
