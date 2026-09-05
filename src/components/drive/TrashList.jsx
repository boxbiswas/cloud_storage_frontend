import React from 'react';
import { RotateCcw, Trash2, Folder, File, FileText, Image as ImageIcon } from 'lucide-react';
import { useRestoreItemMutation, usePermanentDeleteMutation } from '../../redux/api/trashApi';
import toast from 'react-hot-toast';
import DeleteModal from './DeleteModal';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getFileIcon = (mimeType) => {
  if (mimeType?.includes('image')) return <ImageIcon size={20} className="text-blue-500" />;
  if (mimeType?.includes('pdf')) return <FileText size={20} className="text-red-500" />;
  return <File size={20} className="text-slate-500" />;
};

const TrashItem = ({ item, isFolder, onPermanentDelete }) => {
  const [restoreItem, { isLoading: isRestoring }] = useRestoreItemMutation();

  const handleRestore = async () => {
    try {
      await restoreItem({
        resourceType: isFolder ? 'FOLDER' : 'FILE',
        resourceId: item.id
      }).unwrap();
      toast.success(`${item.name} restored`);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to restore item');
    }
  };

  const handleDelete = () => {
    onPermanentDelete(item, isFolder);
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-cloud-200 hover:bg-cloud-50 transition-colors group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-cloud-100 flex items-center justify-center shrink-0">
          {isFolder ? <Folder size={20} className="text-azure-500" fill="currentColor" /> : getFileIcon(item.mimeType)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-slate-800 truncate" title={item.name}>
            {item.name}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-slate-400 font-mono">
              {!isFolder ? formatBytes(item.size_bytes || item.sizeBytes) : 'Folder'}
            </span>
            <span className="text-[11px] text-slate-300">•</span>
            <span className="text-[11px] text-slate-400">
              Deleted: {formatDate(item.deletedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pl-4">
        <button
          onClick={handleRestore}
          disabled={isRestoring}
          className="p-2 rounded-lg text-slate-400 hover:text-azure-600 hover:bg-azure-50 transition-colors"
          title="Restore"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={handleDelete}
          disabled={isRestoring}
          className="p-2 rounded-lg text-slate-400 hover:text-coral-600 hover:bg-coral-50 transition-colors"
          title="Delete permanently"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const TrashList = ({ folders = [], files = [] }) => {
  const [deleteTarget, setDeleteTarget] = React.useState(null); // { item, isFolder }
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [permanentDelete, { isLoading: isDeleting }] = usePermanentDeleteMutation();

  const handleOpenDeleteModal = (item, isFolder) => {
    setDeleteTarget({ item, isFolder });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await permanentDelete({
        resourceType: deleteTarget.isFolder ? 'FOLDER' : 'FILE',
        id: deleteTarget.item.id
      }).unwrap();
      toast.success(`${deleteTarget.item.name} permanently deleted`);
      setIsDeleteModalOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.data?.message || 'Failed to delete item');
    }
  };

  return (
    <>
      <div className="flex flex-col bg-white rounded-xl border border-cloud-200 shadow-sm overflow-hidden">
        {folders.map(folder => (
          <TrashItem key={`folder-${folder.id}`} item={folder} isFolder={true} onPermanentDelete={handleOpenDeleteModal} />
        ))}
        {files.map(file => (
          <TrashItem key={`file-${file.id}`} item={file} isFolder={false} onPermanentDelete={handleOpenDeleteModal} />
        ))}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
        onDelete={handleConfirmDelete}
        item={deleteTarget?.item}
        isLoading={isDeleting}
        title="Permanently Delete?"
        description={deleteTarget?.item ? `Permanently delete "${deleteTarget.item.name}"? This cannot be undone.` : ''}
        confirmText="Delete Forever"
      />
    </>
  );
};

export default TrashList;
