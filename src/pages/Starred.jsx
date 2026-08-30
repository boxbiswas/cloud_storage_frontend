import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useSearchResourcesQuery } from '../redux/api/searchApi';
import FileGrid from '../components/drive/FileGrid';
import SkeletonGrid from '../components/drive/SkeletonGrid';

/**
 * Starred Page
 * Displays all files and folders that the user has starred using RTK Query.
 */
const Starred = () => {
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Fetch starred items via RTK Query
  const { data, isLoading, isError } = useSearchResourcesQuery({ starred: true });

  const results = data?.data || { folders: [], files: [] };
  const pagination = data?.pagination || {};

  const loadMore = async () => {
    toast.error('Pagination merge logic requires endpoint configuration');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-cloud-50/30">
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-cloud-200 bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Star size={20} className="text-amber-500" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900">Starred</h1>
            <p className="text-xs font-medium text-slate-500">Important files and folders</p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        
        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <p className="font-body font-medium text-coral-500">Failed to load starred items.</p>
          </div>
        ) : (results.folders.length === 0 && results.files.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-cloud-100 flex items-center justify-center mb-5">
              <Star size={32} className="text-slate-300" />
            </div>
            <p className="font-display font-semibold text-lg text-slate-900">No starred items</p>
            <p className="font-body text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Add stars to files and folders that you want to easily find later.
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

            {(pagination.nextFileCursor || pagination.nextFolderCursor) && (
              <div className="flex justify-center pt-8 pb-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-white border border-cloud-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-cloud-50 hover:border-amber-300 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loadingMore && <Loader2 size={16} className="animate-spin text-amber-500" />}
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Starred;
