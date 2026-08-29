import React from 'react';
import { Folder, FileText, Image, FileSpreadsheet, File, MoreVertical } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openContextMenu, toggleSelected } from '../../redux/slices/driveSlice';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/**
 * Returns a Lucide icon component based on mime type.
 */
export const getFileIcon = (mimeType, size = 20) => {
  if (!mimeType) return <File size={size} />;
  if (mimeType.startsWith('image/')) return <Image size={size} className="text-sky-400" />;
  if (mimeType === 'application/pdf') return <FileText size={size} className="text-coral-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet size={size} className="text-mint-500" />;
  return <FileText size={size} className="text-slate-400" />;
};

/**
 * Formats bytes into a human-readable string (KB, MB, etc.)
 */
export const formatBytes = (bytes) => {
  if (!bytes) return '—';
  const b = Number(bytes);
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

/**
 * Formats an ISO date string to a short locale date.
 */
export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── FOLDER CARD ─────────────────────────────────────────────────────────────

/**
 * FolderCard - A grid tile for a single folder.
 * Double-click to navigate into it. Right-click for context menu.
 */
const FolderCard = ({ folder, isSelected, onDoubleClick }) => {
  const dispatch = useDispatch();

  const handleContextMenu = (e) => {
    e.preventDefault();
    dispatch(openContextMenu({ x: e.clientX, y: e.clientY, item: folder, itemType: 'folder' }));
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    dispatch(openContextMenu({ x: rect.left, y: rect.bottom + 4, item: folder, itemType: 'folder' }));
  };

  return (
    <div
      onDoubleClick={onDoubleClick}
      onContextMenu={handleContextMenu}
      onClick={() => dispatch(toggleSelected(folder.id))}
      className={`
        group relative flex flex-col gap-3 p-4 rounded-xl2 border cursor-pointer
        transition-all duration-150 select-none
        ${isSelected
          ? 'border-azure-500 bg-azure-100/40 shadow-raised'
          : 'border-cloud-200 bg-white hover:border-azure-500/40 hover:shadow-raised hover:bg-cloud-50'
        }
      `}
    >
      {/* Folder icon */}
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
          ${isSelected ? 'bg-azure-500/20' : 'bg-amber-500/10 group-hover:bg-amber-500/20'}`}
        >
          <Folder size={20} className="text-amber-500" fill="currentColor" fillOpacity={0.3} />
        </div>

        {/* Options button (visible on hover or selection) */}
        <button
          onClick={handleMoreClick}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-all"
          title="More options"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Name */}
      <p className="font-body text-sm font-medium text-slate-800 truncate" title={folder.name}>
        {folder.name}
      </p>
    </div>
  );
};

// ─── FILE CARD ───────────────────────────────────────────────────────────────

/**
 * FileCard - A grid tile for a single file.
 */
const FileCard = ({ file, isSelected }) => {
  const dispatch = useDispatch();

  const handleContextMenu = (e) => {
    e.preventDefault();
    dispatch(openContextMenu({ x: e.clientX, y: e.clientY, item: file, itemType: 'file' }));
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    dispatch(openContextMenu({ x: rect.left, y: rect.bottom + 4, item: file, itemType: 'file' }));
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      onClick={() => dispatch(toggleSelected(file.id))}
      className={`
        group relative flex flex-col gap-3 p-4 rounded-xl2 border cursor-pointer
        transition-all duration-150 select-none
        ${isSelected
          ? 'border-azure-500 bg-azure-100/40 shadow-raised'
          : 'border-cloud-200 bg-white hover:border-azure-500/40 hover:shadow-raised hover:bg-cloud-50'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
          ${isSelected ? 'bg-azure-500/20' : 'bg-cloud-100 group-hover:bg-cloud-200'}`}
        >
          {getFileIcon(file.mime_type || file.mimeType)}
        </div>
        <button
          onClick={handleMoreClick}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-all"
        >
          <MoreVertical size={14} />
        </button>
      </div>

      <div>
        <p className="font-body text-sm font-medium text-slate-800 truncate" title={file.name}>
          {file.name}
        </p>
        <p className="font-mono text-[11px] text-slate-400 mt-0.5">
          {formatBytes(file.size_bytes || file.sizeBytes)}
        </p>
      </div>
    </div>
  );
};

// ─── GRID CONTAINER ───────────────────────────────────────────────────────────

/**
 * FileGrid - Renders folders and files in a responsive grid layout.
 *
 * Props:
 *   folders       - Folder array
 *   files         - File array
 *   selectedIds   - string[] from Redux
 *   onFolderOpen  - (folderId) => void
 */
const FileGrid = ({ folders, files, selectedIds, onFolderOpen }) => {
  const hasFolders = folders.length > 0;
  const hasFiles = files.length > 0;

  if (!hasFolders && !hasFiles) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-cloud-100 flex items-center justify-center mb-4">
          <Folder size={28} className="text-slate-300" />
        </div>
        <p className="font-body font-medium text-slate-500">This folder is empty</p>
        <p className="font-body text-sm text-slate-400 mt-1">Upload files or create a new folder to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Folders section */}
      {hasFolders && (
        <section>
          <h3 className="font-body text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Folders
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {folders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                isSelected={selectedIds.includes(folder.id)}
                onDoubleClick={() => onFolderOpen(folder.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Files section */}
      {hasFiles && (
        <section>
          <h3 className="font-body text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Files
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {files.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedIds.includes(file.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default FileGrid;
