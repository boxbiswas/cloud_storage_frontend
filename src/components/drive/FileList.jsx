import React from 'react';
import { Folder, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { openContextMenu, toggleSelected, setSortBy } from '../../redux/slices/driveSlice';
import { getFileIcon, formatBytes, formatDate } from './FileGrid';
import StarButton from '../common/StarButton';
import UploadDropzone from '../upload/UploadDropzone';

/**
 * FileList - Renders folders and files in a compact table/list layout.
 * Supports column header sorting.
 *
 * Props:
 *   folders       - Folder array
 *   files         - File array
 *   onFolderOpen  - (folderId) => void
 *   onFileOpen    - (file) => void
 */
const FileList = ({ folders, files, selectedIds, onFolderOpen, onFileOpen, currentFolderId }) => {
  const dispatch = useDispatch();
  const { sortBy, sortDir } = useSelector((state) => state.drive);

  const hasFolders = folders.length > 0;
  const hasFiles = files.length > 0;

  if (!hasFolders && !hasFiles) {
    return (
      <div className="h-full flex flex-col justify-center items-center py-12 max-w-2xl mx-auto w-full">
        <UploadDropzone folderId={currentFolderId} />
      </div>
    );
  }

  /* ── Sort Indicator ── */
  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp size={12} className="text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-azure-500" />
      : <ChevronDown size={12} className="text-azure-500" />;
  };

  /* ── Header Cell ── */
  const HeaderCell = ({ col, label, className = '' }) => (
    <th
      onClick={() => dispatch(setSortBy(col))}
      className={`text-left px-3 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors select-none ${className}`}
    >
      <span className="flex items-center gap-1">
        {label}
        <SortIcon col={col} />
      </span>
    </th>
  );

  /* ── Row Component (shared for both folders and files) ── */
  const Row = ({ item, itemType, icon, size, date, owner, onDoubleClick }) => {
    const isSelected = selectedIds.includes(item.id);

    const handleContextMenu = (e) => {
      e.preventDefault();
      dispatch(openContextMenu({ x: e.clientX, y: e.clientY, item, itemType }));
    };

    const handleMoreClick = (e) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      dispatch(openContextMenu({ x: rect.left, y: rect.bottom + 4, item, itemType }));
    };

    return (
      <tr
        onDoubleClick={onDoubleClick}
        onContextMenu={handleContextMenu}
        onClick={() => dispatch(toggleSelected(item.id))}
        className={`
          group transition-colors duration-100 cursor-pointer select-none
          ${isSelected ? 'bg-azure-100/50' : 'hover:bg-cloud-50'}
        `}
      >
        {/* Icon + Name */}
        <td className="px-3 py-2.5 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
            ${isSelected ? 'bg-azure-100' : 'bg-cloud-100 group-hover:bg-cloud-200'}`}
          >
            {icon}
          </div>
          <span className="font-body text-sm font-medium text-slate-800 truncate max-w-[240px]" title={item.name}>
            {item.name}
          </span>
        </td>

        {/* Size */}
        <td className="px-3 py-2.5 font-mono text-xs text-slate-400 whitespace-nowrap">
          {size}
        </td>

        {/* Date */}
        <td className="px-3 py-2.5 font-body text-xs text-slate-400 whitespace-nowrap">
          {date}
        </td>

        {/* Owner */}
        <td className="px-3 py-2.5 font-body text-xs text-slate-400 whitespace-nowrap">
          {owner}
        </td>

        {/* Actions */}
        <td className="px-3 py-2.5 w-16">
          <div className="flex items-center justify-end gap-1">
            <StarButton item={item} itemType={itemType} />
            <button
              onClick={handleMoreClick}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-all"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl2 border border-cloud-200 bg-white">
      <table className="w-full border-collapse">
        <thead className="border-b border-cloud-200 bg-cloud-50/60">
          <tr>
            <HeaderCell col="name" label="Name" className="pl-3 w-full" />
            <HeaderCell col="size" label="Size" />
            <HeaderCell col="createdAt" label="Modified" />
            <HeaderCell col="owner" label="Owner" />
            <th className="w-10" /> {/* actions */}
          </tr>
        </thead>
        <tbody className="divide-y divide-cloud-100">
          {/* Folders first */}
          {folders.map((folder) => (
            <Row
              key={folder.id}
              item={folder}
              itemType="folder"
              icon={<Folder size={16} className="text-amber-500" fill="currentColor" fillOpacity={0.3} />}
              size="—"
              date={formatDate(folder.created_at || folder.createdAt)}
              owner={folder.owner?.name || 'Unknown'}
              onDoubleClick={() => onFolderOpen(folder.id)}
            />
          ))}

          {/* Files */}
          {files.map((file) => (
            <Row
              key={file.id}
              item={file}
              itemType="file"
              icon={getFileIcon(file.mime_type || file.mimeType, 16)}
              size={formatBytes(file.size_bytes || file.sizeBytes)}
              date={formatDate(file.created_at || file.createdAt)}
              owner={file.owner?.name || 'Unknown'}
              onDoubleClick={() => onFileOpen(file)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;
