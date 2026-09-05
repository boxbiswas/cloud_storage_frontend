import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { LayoutGrid, List, FolderPlus, Upload as UploadIcon, RefreshCw, Loader2 } from 'lucide-react';

// RTK Query Hooks
import { 
  useGetFolderContentsQuery, 
  useCreateFolderMutation,
  useRenameFolderMutation,
  useDeleteFolderMutation,
  useMoveFolderMutation
} from '../redux/api/folderApi';
import { 
  useRenameFileMutation,
  useDeleteFileMutation,
  useMoveFileMutation,
  useGetDownloadUrlMutation
} from '../redux/api/fileApi';

// Redux actions
import {
  setCurrentFolder,
  setViewMode,
  clearSelection,
  closeContextMenu,
} from '../redux/slices/driveSlice';

// Components
import Breadcrumbs from '../components/drive/Breadcrumbs';
import SearchBar from '../components/search/SearchBar';
import FileGrid from '../components/drive/FileGrid';
import FileList from '../components/drive/FileList';
import ContextMenu from '../components/drive/ContextMenu';
import NewFolderModal from '../components/drive/NewFolderModal';
import RenameModal from '../components/drive/RenameModal';
import MoveModal from '../components/drive/MoveModal';
import ShareModal from '../components/sharing/ShareModal';
import DeleteModal from '../components/drive/DeleteModal';
import FilePreviewModal from '../components/drive/FilePreviewModal';
import UploadDropzone from '../components/upload/UploadDropzone';
import SkeletonGrid from '../components/drive/SkeletonGrid';

/**
 * Drive — the main file browser page (My Drive).
 * Fully refactored to use RTK Query for automated caching and invalidation.
 */
const Drive = () => {
  const dispatch = useDispatch();

  // ── Local UI State (Redux) ──
  const {
    currentFolderId,
    viewMode,
    sortBy,
    sortDir,
    selectedIds,
    contextMenu,
  } = useSelector((state) => state.drive);

  // ── RTK Query Data Fetching ──
  const { 
    data: folderData, 
    isLoading, 
    isFetching,
    isError, 
    refetch 
  } = useGetFolderContentsQuery(currentFolderId);

  // Default to empty arrays if no data
  const breadcrumbs = folderData?.breadcrumbs || [];
  const folders = folderData?.children?.folders || folderData?.folders || [];
  const files = folderData?.children?.files || folderData?.files || [];

  // ── RTK Query Mutations ──
  const [createFolder, { isLoading: isCreating }] = useCreateFolderMutation();
  const [renameFolder] = useRenameFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const [moveFolder] = useMoveFolderMutation();
  
  const [renameFile] = useRenameFileMutation();
  const [deleteFile] = useDeleteFileMutation();
  const [moveFile] = useMoveFileMutation();
  const [getDownloadUrl] = useGetDownloadUrlMutation();

  // ── Local modal state ──
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null); // { item, itemType }
  const [moveTarget, setMoveTarget] = useState(null); // { item, itemType }
  const [deleteTarget, setDeleteTarget] = useState(null); // { item, itemType }
  const [shareTarget, setShareTarget] = useState(null); // { item, itemType }
  const [actionLoading, setActionLoading] = useState(false); // Used for rename/move actions
  const [showDropzone, setShowDropzone] = useState(false);

  // For File Preview
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState({ file: null, url: null });

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────

  const handleFolderOpen = (folderId) => {
    dispatch(setCurrentFolder(folderId));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Mutations / CRUD Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleCreateFolder = async (name) => {
    try {
      await createFolder({ name, parentId: currentFolderId }).unwrap();
      toast.success(`"${name}" created`);
      setIsNewFolderOpen(false);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create folder');
    }
  };

  /** Commit the rename to the API (cache invalidation handles UI update) */
  const handleRenameCommit = async (newName) => {
    if (!renameTarget) return;
    setActionLoading(true);
    const { item, itemType } = renameTarget;
    try {
      if (itemType === 'folder') {
        await renameFolder({ id: item.id, name: newName, parentId: currentFolderId }).unwrap();
      } else {
        await renameFile({ id: item.id, name: newName, parentId: currentFolderId }).unwrap();
      }
      toast.success('Renamed successfully');
      setIsRenameOpen(false);
    } catch (err) {
      toast.error(err.data?.message || 'Rename failed');
    } finally {
      setActionLoading(false);
      setRenameTarget(null);
    }
  };

  /** Delete the right-clicked item (soft delete) */
  const handleDelete = (item, itemType) => {
    setDeleteTarget({ item, itemType });
    setIsDeleteOpen(true);
  };

  const confirmDelete = async (item, itemType) => {
    try {
      setActionLoading(true);
      if (itemType === 'folder') {
        await deleteFolder({ id: item.id, parentId: currentFolderId }).unwrap();
      } else {
        await deleteFile({ id: item.id, parentId: currentFolderId }).unwrap();
      }
      toast.success(`Moved "${item.name}" to trash`);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.data?.message || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveRequest = (item, itemType) => {
    setMoveTarget({ item, itemType });
    setIsMoveOpen(true);
  };

  const handleMoveCommit = async (destinationFolderId, item, itemType) => {
    setActionLoading(true);
    try {
      if (itemType === 'folder') {
        await moveFolder({ 
          id: item.id, 
          parentId: destinationFolderId,
          oldParentId: item.parentId || 'root',
          item: item // for optimistic cache
        }).unwrap();
      } else {
        await moveFile({ 
          id: item.id, 
          folderId: destinationFolderId,
          oldParentId: item.folderId || 'root',
          item: item // for optimistic cache
        }).unwrap();
      }
      toast.success(`"${item.name}" moved successfully`);
      setIsMoveOpen(false);
    } catch (err) {
      toast.error(err.data?.message || 'Move failed');
    } finally {
      setActionLoading(false);
      setMoveTarget(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Context Menu Handlers
  // ─────────────────────────────────────────────────────────────────────────

  const handleRenameRequest = (item, itemType) => {
    setRenameTarget({ item, itemType });
    setIsRenameOpen(true);
  };

  const handleShareRequest = (item, itemType) => {
    setShareTarget({ item, itemType });
    setIsShareOpen(true);
  };

  const handleDownload = async (item) => {
    try {
      const toastId = toast.loading(`Preparing download for "${item.name}"...`);
      const response = await getDownloadUrl(item.id).unwrap();
      toast.dismiss(toastId);
      
      const downloadUrl = response.signedUrl;
      if (!downloadUrl) throw new Error('No download URL returned');
      
      // Trigger programmatic download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = item.name; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download file');
      console.error(err);
    }
  };

  const handleFileOpen = async (item) => {
    try {
      const toastId = toast.loading(`Opening "${item.name}"...`);
      const response = await getDownloadUrl(item.id).unwrap();
      toast.dismiss(toastId);
      
      const fileUrl = response.signedUrl;
      if (!fileUrl) throw new Error('No URL returned');
      
      setPreviewTarget({ file: item, url: fileUrl });
      setIsPreviewOpen(true);
    } catch (err) {
      toast.error('Failed to open file');
      console.error(err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Sorting (client-side within the current view)
  // ─────────────────────────────────────────────────────────────────────────

  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      let valA, valB;
      if (sortBy === 'name') {
        valA = (a.name || '').toLowerCase();
        valB = (b.name || '').toLowerCase();
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
    <div
      className="flex flex-col h-full overflow-hidden"
      onClick={() => dispatch(closeContextMenu())}
    >
      {/* ── Top Toolbar ── */}
      <div className="flex flex-col gap-4 px-6 py-4 border-b border-cloud-200 bg-white/70 backdrop-blur-xs shrink-0">
        <div className="flex items-center justify-between">
          <Breadcrumbs breadcrumbs={breadcrumbs} currentFolderId={currentFolderId} />

          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              disabled={isFetching}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => setIsNewFolderOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-cloud-100 border border-cloud-200 transition-all"
            >
              <FolderPlus size={15} />
              <span className="hidden sm:inline">New Folder</span>
            </button>

            <button
              onClick={() => setShowDropzone(v => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-azure-500 text-white hover:bg-azure-600 active:scale-95 transition-all shadow-raised"
            >
              <UploadIcon size={15} />
              <span>Upload</span>
            </button>

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
        
        {/* Search */}
        <div className="w-full">
          <SearchBar isFiltersOpen={false} onToggleFilters={() => {}} />
        </div>
      </div>

      {showDropzone && (
        <div className="px-6 pt-4 shrink-0">
          <UploadDropzone folderId={currentFolderId} />
        </div>
      )}

      {/* ── Main Content Area ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <SkeletonGrid count={12} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-coral-500 font-body font-medium">Failed to load folder contents</p>
            <button onClick={refetch} className="mt-3 text-sm text-azure-500 hover:underline">
              Try again
            </button>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <FileGrid
              folders={sortedFolders}
              files={sortedFiles}
              selectedIds={selectedIds}
              onFolderOpen={handleFolderOpen}
              onFileOpen={handleFileOpen}
              currentFolderId={currentFolderId}
            />
          ) : (
            <FileList
              folders={sortedFolders}
              files={sortedFiles}
              selectedIds={selectedIds}
              onFolderOpen={handleFolderOpen}
              onFileOpen={handleFileOpen}
              currentFolderId={currentFolderId}
            />
          )
        )}
      </div>

      {/* ── Modals & Context Menu ── */}
      <ContextMenu
        menu={contextMenu}
        onRename={handleRenameRequest}
        onDelete={handleDelete}
        onMove={handleMoveRequest}
        onShare={handleShareRequest}
        onDownload={handleDownload}
      />

      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreate={handleCreateFolder}
        isLoading={isCreating}
      />

      <RenameModal
        isOpen={isRenameOpen}
        onClose={() => { setIsRenameOpen(false); setRenameTarget(null); }}
        onRename={handleRenameCommit}
        currentName={renameTarget?.item?.name || ''}
        itemType={renameTarget?.itemType || 'item'}
        isLoading={actionLoading}
      />

      <MoveModal
        isOpen={isMoveOpen}
        onClose={() => { setIsMoveOpen(false); setMoveTarget(null); }}
        onMoveCommit={handleMoveCommit}
        item={moveTarget?.item}
        itemType={moveTarget?.itemType}
        isLoading={actionLoading}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => { setIsShareOpen(false); setShareTarget(null); }}
        item={shareTarget?.item}
        itemType={shareTarget?.itemType || 'item'}
      />

      <FilePreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => { setIsPreviewOpen(false); setPreviewTarget({ file: null, url: null }); }}
        file={previewTarget?.file}
        fileUrl={previewTarget?.url}
      />

      <DeleteModal
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeleteTarget(null); }}
        onDelete={confirmDelete}
        item={deleteTarget?.item}
        itemType={deleteTarget?.itemType}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default Drive;
