import React from 'react';
import { Trash2, Loader2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetTrashQuery, useRestoreItemMutation, useEmptyTrashMutation } from '../redux/api/trashApi';
import FileGrid from '../components/drive/FileGrid';
import SkeletonGrid from '../components/drive/SkeletonGrid';

/**
 * Trash Page
 * Displays deleted files and folders.
 */
const Trash = () => {
  const { data, isLoading, isError, refetch } = useGetTrashQuery();
  const [emptyTrash, { isLoading: isEmptying }] = useEmptyTrashMutation();
  
  const results = data?.data || { folders: [], files: [] };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Are you sure you want to permanently delete all items in the trash? This cannot be undone.')) return;
    
    try {
      await emptyTrash().unwrap();
      toast.success('Trash emptied successfully');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to empty trash');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-cloud-50/30">
      <div className="flex items-center justify-between px-6 py-5 border-b border-cloud-200 bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-coral-100 flex items-center justify-center">
            <Trash2 size={20} className="text-coral-600" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900">Trash</h1>
            <p className="text-xs font-medium text-slate-500">Items deleted from your vault</p>
          </div>
        </div>
        
        <button
          onClick={handleEmptyTrash}
          disabled={isEmptying || (results.folders.length === 0 && results.files.length === 0)}
          className="px-4 py-2 text-sm font-medium text-coral-600 hover:text-coral-700 hover:bg-coral-50 border border-coral-200 rounded-xl transition-all disabled:opacity-50"
        >
          {isEmptying ? 'Emptying...' : 'Empty Trash'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-6 p-4 bg-cloud-100 border border-cloud-200 rounded-xl flex items-center gap-3 text-sm text-slate-600">
          <div className="p-1.5 bg-white rounded-lg shadow-sm">
            <RotateCcw size={16} className="text-slate-500" />
          </div>
          <p>Items in the trash are deleted forever after 30 days.</p>
        </div>

        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <p className="font-body font-medium text-coral-500">Failed to load trash.</p>
             <button onClick={refetch} className="mt-2 text-sm text-azure-500 hover:underline">Try again</button>
          </div>
        ) : (results.folders.length === 0 && results.files.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-cloud-100 flex items-center justify-center mb-5">
              <Trash2 size={32} className="text-slate-300" />
            </div>
            <p className="font-display font-semibold text-lg text-slate-900">Trash is empty</p>
            <p className="font-body text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
              No items have been deleted recently.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <FileGrid 
              folders={results.folders} 
              files={results.files} 
              selectedIds={[]} 
              onFolderOpen={() => {}} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Trash;
