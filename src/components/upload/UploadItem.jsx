import React from 'react';
import { useDispatch } from 'react-redux';
import { removeUpload } from '../../redux/slices/uploadSlice';
import { uploadFile, activeFiles } from '../../services/uploadService';

const UploadItem = ({ upload }) => {
  const dispatch = useDispatch();
  const { id, name, size, progress, status, error } = upload;

  const handleRetry = () => {
    // If the file is still in the activeFiles map, we can retry uploading it
    const file = activeFiles.get(id);
    if (file) {
      dispatch(removeUpload({ id }));
      uploadFile(file); // This will generate a new UUID and restart
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex items-center gap-3 bg-white border border-cloud-200/60 rounded-lg px-4 py-3 shadow-raised mb-2 last:mb-0">
      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 
        ${status === 'SUCCESS' ? 'bg-mint-500/10 text-mint-500' : 
          status === 'ERROR' ? 'bg-coral-500/10 text-coral-500' : 'bg-azure-100 text-azure-600'}`}
      >
        {status === 'SUCCESS' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : status === 'ERROR' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <p className="font-body text-sm text-slate-900 truncate pr-2">{name}</p>
          {status === 'ERROR' ? (
            <span className="font-mono text-[10px] text-coral-500 shrink-0">Failed</span>
          ) : (
            <span className="font-mono text-[10px] text-slate-500 shrink-0">{status === 'SUCCESS' ? formatSize(size) : `${progress}%`}</span>
          )}
        </div>
        
        {status === 'ERROR' ? (
          <p className="font-body text-[11px] text-coral-500 truncate">{error}</p>
        ) : (
          <div className="h-1.5 rounded-full bg-cloud-200 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${status === 'SUCCESS' ? 'bg-mint-500' : 'bg-azure-500'}`}
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center">
        {status === 'ERROR' && activeFiles.has(id) ? (
          <button onClick={handleRetry} className="p-1.5 text-slate-400 hover:text-azure-600 hover:bg-azure-50 rounded-md transition-colors" title="Retry">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        ) : null}
        
        <button 
          onClick={() => dispatch(removeUpload({ id }))} 
          className="p-1.5 text-slate-400 hover:text-coral-500 hover:bg-coral-50 rounded-md transition-colors ml-1"
          title={status === 'SUCCESS' ? 'Dismiss' : 'Cancel'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UploadItem;
