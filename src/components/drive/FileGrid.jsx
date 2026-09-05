import React from 'react';
import { Folder, FileText, Image, FileSpreadsheet, File, MoreVertical } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openContextMenu, toggleSelected } from '../../redux/slices/driveSlice';
import StarButton from '../common/StarButton';
import UploadDropzone from '../upload/UploadDropzone';

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

        <div className="flex items-center">
          <StarButton item={folder} itemType="folder" />
          {/* Options button (visible on hover or selection) */}
          <button
            onClick={handleMoreClick}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-all"
            title="More options"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      <div>
        <p className="font-body text-sm font-medium text-slate-800 truncate" title={folder.name}>
          {folder.name}
        </p>
        <p className="font-mono text-[11px] text-slate-400 mt-0.5 truncate" title={folder.owner?.name || 'Unknown'}>
          {folder.owner?.name || 'Unknown'}
        </p>
      </div>
    </div>
  );
};

// ─── FILE CARD ───────────────────────────────────────────────────────────────

/**
 * FileCard - A grid tile for a single file.
 */
const FileCard = ({ file, isSelected, onDoubleClick }) => {
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
      onDoubleClick={onDoubleClick}
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
        <div className="flex items-center">
          <StarButton item={file} itemType="file" />
          <button
            onClick={handleMoreClick}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-all"
          >
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      <div>
        <p className="font-body text-sm font-medium text-slate-800 truncate" title={file.name}>
          {file.name}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <p className="font-mono text-[11px] text-slate-400">
            {formatBytes(file.size_bytes || file.sizeBytes)}
          </p>
          <p className="font-mono text-[11px] text-slate-400 truncate max-w-[80px]" title={file.owner?.name || 'Unknown'}>
            {file.owner?.name || 'Unknown'}
          </p>
        </div>
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
 *   onFileOpen    - (file) => void
 */
const FileGrid = ({ folders, files, selectedIds, onFolderOpen, onFileOpen, currentFolderId }) => {
  const hasFolders = folders.length > 0;
  const hasFiles = files.length > 0;

  if (!hasFolders && !hasFiles) {
    return (
      <div className="h-full flex flex-col justify-center items-center py-12 max-w-2xl mx-auto w-full">
        <UploadDropzone folderId={currentFolderId} />
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
                onDoubleClick={() => onFileOpen(file)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default FileGrid;
