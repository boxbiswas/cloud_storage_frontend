import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTray, clearCompleted } from '../../redux/slices/uploadSlice';
import UploadItem from './UploadItem';

const UploadTray = () => {
  const dispatch = useDispatch();
  const { uploads, isTrayOpen } = useSelector((state) => state.upload);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isTrayOpen && uploads.length === 0) return null;

  const activeCount = uploads.filter(u => u.status === 'UPLOADING' || u.status === 'PENDING').length;
  const completedCount = uploads.filter(u => u.status === 'SUCCESS').length;
  const failedCount = uploads.filter(u => u.status === 'ERROR').length;

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] z-50 flex flex-col items-end">
      {/* Main Tray Body */}
      <div 
        className={`
          w-full bg-white/80 backdrop-blur-2xl backdrop-saturate-150 
          border border-white/80 rounded-xl2 shadow-glass-lg overflow-hidden
          transition-all duration-300 transform origin-bottom
          ${isMinimized ? 'scale-y-0 opacity-0 h-0 pointer-events-none' : 'scale-y-100 opacity-100 max-h-[60vh] flex flex-col'}
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-200/60 bg-white/50">
          <div>
            <h3 className="font-body font-semibold text-sm text-slate-900">
              {activeCount > 0 ? `Uploading ${activeCount} file${activeCount > 1 ? 's' : ''}` : 'Uploads Complete'}
            </h3>
            <p className="font-mono text-[10px] text-slate-500 mt-0.5">
              {completedCount} completed {failedCount > 0 && `· ${failedCount} failed`}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            {completedCount > 0 && activeCount === 0 && (
              <button 
                onClick={() => dispatch(clearCompleted())}
                className="text-[11px] font-semibold text-azure-600 hover:text-azure-700 px-2 py-1 mr-2"
              >
                Clear all
              </button>
            )}
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-white/60 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          {uploads.length === 0 ? (
            <div className="text-center py-6 text-slate-500 font-body text-sm">No active uploads</div>
          ) : (
            uploads.map((upload) => (
              <UploadItem key={upload.id} upload={upload} />
            ))
          )}
        </div>
      </div>

      {/* Minimized Pill */}
      {isMinimized && (
        <button 
          onClick={() => setIsMinimized(false)}
          className="mt-4 bg-white/90 backdrop-blur-glass border border-cloud-200/60 shadow-glass-md rounded-full px-5 py-3 flex items-center gap-3 hover:-translate-y-1 hover:shadow-glass-lg transition-all"
        >
          {activeCount > 0 ? (
            <div className="w-4 h-4 rounded-full border-2 border-azure-500 border-t-transparent animate-spin" />
          ) : failedCount > 0 ? (
            <div className="w-3 h-3 rounded-full bg-coral-500" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-mint-500" />
          )}
          <span className="font-body text-sm font-semibold text-slate-900">
            {activeCount > 0 ? `${activeCount} uploading...` : 'Uploads'}
          </span>
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default UploadTray;
