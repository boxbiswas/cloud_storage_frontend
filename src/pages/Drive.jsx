import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LayoutGrid, List, FolderPlus, Upload as UploadIcon, RefreshCw } from 'lucide-react';

// Redux actions
import {
  setCurrentFolder,
  setLoading,
  setFolderContents,
  setError,
  addFolder,
  updateFolder,
  removeFolder,
  updateFile,
  removeFile,
  setViewMode,
  clearSelection,
  closeContextMenu,
} from '../redux/slices/driveSlice';

// API services
import {
  fetchFolderContents,
  createFolderApi,
  renameFolderApi,
  deleteFolderApi,
  renameFileApi,
  deleteFileApi,
} from '../services/driveService';

// Components
import Breadcrumbs from '../components/drive/Breadcrumbs';
import FileGrid from '../components/drive/FileGrid';
import FileList from '../components/drive/FileList';
import ContextMenu from '../components/drive/ContextMenu';
import NewFolderModal from '../components/drive/NewFolderModal';
import RenameModal from '../components/drive/RenameModal';
import UploadDropzone from '../components/upload/UploadDropzone';

/**
 * Drive — the main file browser page (My Drive).
 * Manages the top-level orchestration: fetching data, dispatching actions,
 * and coordinating modals.
 */
const Drive = () => {
  const dispatch = useDispatch();

  // ── Selectors ──
  const {
    currentFolderId,
    breadcrumbs,
    folders,
    files,
    viewMode,
    sortBy,
    sortDir,
    loading,
    error,
    selectedIds,
    contextMenu,
  } = useSelector((state) => state.drive);

  // ── Local modal state ──
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null); // { item, itemType }
  const [actionLoading, setActionLoading] = useState(false);
  const [showDropzone, setShowDropzone] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Data Fetching
  // ─────────────────────────────────────────────────────────────────────────

  const loadFolder = useCallback(async (folderId) => {
    dispatch(setLoading(true));
    dispatch(clearSelection());
    try {
      const data = await fetchFolderContents(folderId);
      // Backend returns { folder, breadcrumbs, children: { folders, files } }
      dispatch(setFolderContents({
        breadcrumbs: folderId ? (data.breadcrumbs || []) : [],
        folders: data.children?.folders || data.folders || [],
        files: data.children?.files || data.files || [],
      }));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load folder';
      dispatch(setError(msg));
      toast.error(msg);
    }
  }, [dispatch]);

  // Load contents when the current folder changes
  useEffect(() => {
    loadFolder(currentFolderId);
  }, [currentFolderId, loadFolder]);

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────

  const handleFolderOpen = (folderId) => {
    dispatch(setCurrentFolder(folderId));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Folder CRUD
  // ─────────────────────────────────────────────────────────────────────────

  const handleCreateFolder = async (name) => {
    setActionLoading(true);
    try {
      const folder = await createFolderApi({ name, parentId: currentFolderId });
      dispatch(addFolder(folder));
      toast.success(`"${folder.name}" created`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create folder');
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Context Menu Handlers
  // ─────────────────────────────────────────────────────────────────────────

  /** Open the rename modal for whichever item was right-clicked */
  const handleRenameRequest = (item, itemType) => {
    setRenameTarget({ item, itemType });
    setIsRenameOpen(true);
  };

  /** Commit the rename to the API then update Redux optimistically */
  const handleRenameCommit = async (newName) => {
    if (!renameTarget) return;
    setActionLoading(true);
    const { item, itemType } = renameTarget;
    try {
      if (itemType === 'folder') {
        await renameFolderApi(item.id, newName);
        dispatch(updateFolder({ id: item.id, changes: { name: newName } }));
      } else {
        await renameFileApi(item.id, newName);
        dispatch(updateFile({ id: item.id, changes: { name: newName } }));
      }
      toast.success('Renamed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rename failed');
    } finally {
      setActionLoading(false);
      setRenameTarget(null);
    }
  };

  /** Delete the right-clicked item (soft delete) */
  const handleDelete = async (item, itemType) => {
    const confirmed = window.confirm(
      `Move "${item.name}" to trash?`
    );
    if (!confirmed) return;

    try {
      if (itemType === 'folder') {
        await deleteFolderApi(item.id);
        dispatch(removeFolder(item.id));
      } else {
        await deleteFileApi(item.id);
        dispatch(removeFile(item.id));
      }
      toast.success(`"${item.name}" moved to trash`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  /** Move — placeholder: full implementation requires a folder picker modal */
  const handleMove = (item, itemType) => {
    toast('Move feature coming soon!', { icon: '📁' });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Sorting (client-side within the current view)
  // ─────────────────────────────────────────────────────────────────────────

  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortBy === 'createdAt') {
        valA = new Date(a.created_at || a.createdAt || 0);
        valB = new Date(b.created_at || b.createdAt || 0);
      } else if (sortBy === 'size') {
        valA = Number(a.size_bytes || a.sizeBytes || 0);
        valB = Number(b.size_bytes || b.sizeBytes || 0);
      }
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  };

  const sortedFolders = sortItems(folders);
  const sortedFiles = sortItems(files);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    // Close context menu when clicking the bare drive area
    <div
      className="flex flex-col h-full overflow-hidden"
      onClick={() => dispatch(closeContextMenu())}
    >
      {/* ── Top Toolbar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cloud-200 bg-white/70 backdrop-blur-xs shrink-0">
        {/* Breadcrumbs */}
        <Breadcrumbs breadcrumbs={breadcrumbs} currentFolderId={currentFolderId} />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Refresh */}
          <button
            onClick={() => loadFolder(currentFolderId)}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          {/* New Folder */}
          <button
            onClick={() => setIsNewFolderOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-cloud-100 border border-cloud-200 transition-all"
          >
            <FolderPlus size={15} />
            <span className="hidden sm:inline">New Folder</span>
          </button>

          {/* Upload toggle */}
          <button
            onClick={() => setShowDropzone(v => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-azure-500 text-white hover:bg-azure-600 active:scale-95 transition-all shadow-raised"
          >
            <UploadIcon size={15} />
            <span>Upload</span>
          </button>

          {/* View mode toggle */}
          <div className="flex items-center border border-cloud-200 rounded-xl overflow-hidden">
            <button
              onClick={() => dispatch(setViewMode('grid'))}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-azure-100 text-azure-600' : 'text-slate-400 hover:text-slate-700 hover:bg-cloud-50'}`}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => dispatch(setViewMode('list'))}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-azure-100 text-azure-600' : 'text-slate-400 hover:text-slate-700 hover:bg-cloud-50'}`}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Upload Dropzone (collapsible) ── */}
      {showDropzone && (
        <div className="px-6 pt-4 shrink-0">
          <UploadDropzone folderId={currentFolderId} />
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Loading skeleton */}
        {loading && (
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-4 bg-cloud-200 rounded w-32" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-24 bg-cloud-100 rounded-xl2" />
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-coral-500 font-body font-medium">{error}</p>
            <button
              onClick={() => loadFolder(currentFolderId)}
              className="mt-3 text-sm text-azure-500 hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* File browser */}
        {!loading && !error && (
          viewMode === 'grid' ? (
            <FileGrid
              folders={sortedFolders}
              files={sortedFiles}
              selectedIds={selectedIds}
              onFolderOpen={handleFolderOpen}
            />
          ) : (
            <FileList
              folders={sortedFolders}
              files={sortedFiles}
              selectedIds={selectedIds}
              onFolderOpen={handleFolderOpen}
            />
          )
        )}
      </div>

      {/* ── Context Menu (portal-like, rendered last so it's on top) ── */}
      <ContextMenu
        menu={contextMenu}
        onRename={handleRenameRequest}
        onDelete={handleDelete}
        onMove={handleMove}
      />

      {/* ── Modals ── */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreate={handleCreateFolder}
        isLoading={actionLoading}
      />

      <RenameModal
        isOpen={isRenameOpen}
        onClose={() => { setIsRenameOpen(false); setRenameTarget(null); }}
        onRename={handleRenameCommit}
        currentName={renameTarget?.item?.name || ''}
        itemType={renameTarget?.itemType || 'item'}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default Drive;
