import React from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentFolder } from '../redux/slices/driveSlice';
import { useSearchResourcesQuery } from '../redux/api/searchApi';
import FileGrid from '../components/drive/FileGrid';
import SkeletonGrid from '../components/drive/SkeletonGrid';

/**
 * Shared Page
 * Displays all files and folders shared with the user.
 */
const Shared = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { data, isLoading, isError } = useSearchResourcesQuery({ shared: true });
  
  const results = data?.data || { folders: [], files: [] };

  const handleFolderOpen = (folderId) => {
    dispatch(setCurrentFolder(folderId));
    navigate('/drive');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-cloud-50/30">
      <div className="flex items-center justify-between px-6 py-5 border-b border-cloud-200 bg-white z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-azure-100 flex items-center justify-center">
            <Users size={20} className="text-azure-600" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900">Shared with me</h1>
            <p className="text-xs font-medium text-slate-500">Items other people have shared with you</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {isLoading ? (
          <SkeletonGrid count={8} />
        ) : isError || (results.folders.length === 0 && results.files.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-cloud-100 flex items-center justify-center mb-5">
              <Users size={32} className="text-slate-300" />
            </div>
            <p className="font-display font-semibold text-lg text-slate-900">Nothing shared yet</p>
            <p className="font-body text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
              Files and folders that others share with you will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <FileGrid 
              folders={results.folders} 
              files={results.files} 
              selectedIds={[]} 
              onFolderOpen={handleFolderOpen} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Shared;
