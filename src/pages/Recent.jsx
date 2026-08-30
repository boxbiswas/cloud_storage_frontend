import React from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { useSearchResourcesQuery } from '../redux/api/searchApi';
import FileGrid from '../components/drive/FileGrid';
import SkeletonGrid from '../components/drive/SkeletonGrid';

/**
 * Recent Page
 * Displays recently modified files and folders.
 */
const Recent = () => {
  // Sort by updatedAt descending
  const { data, isLoading, isError } = useSearchResourcesQuery({ sort: 'updatedAt', order: 'desc' });
  
  const results = data?.data || { folders: [], files: [] };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-cloud-50/30">
      <div className="flex items-center justify-between px-6 py-5 border-b border-cloud-200 bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Clock size={20} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900">Recent</h1>
            <p className="text-xs font-medium text-slate-500">Items you've opened or modified recently</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : isError || (results.folders.length === 0 && results.files.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-cloud-100 flex items-center justify-center mb-5">
              <Clock size={32} className="text-slate-300" />
            </div>
            <p className="font-display font-semibold text-lg text-slate-900">No recent items</p>
            <p className="font-body text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Files and folders you modify will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <FileGrid folders={results.folders} files={results.files} selectedIds={[]} onFolderOpen={() => {}} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Recent;
