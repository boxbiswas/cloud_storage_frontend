import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';

const FilePreviewModal = ({ isOpen, onClose, file, fileUrl }) => {
  if (!isOpen || !file) return null;

  const isImage = file.mimeType?.startsWith('image/') || file.mime_type?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/') || file.mime_type?.startsWith('video/');
  const isPdf = file.mimeType === 'application/pdf' || file.mime_type === 'application/pdf';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="text-sm font-medium text-white truncate max-w-md" title={file.name}>
              {file.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink size={18} />
            </a>
            <a 
              href={fileUrl} 
              download={file.name}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Download"
            >
              <Download size={18} />
            </a>
            <button 
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors ml-2"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative bg-slate-900/50">
          {!fileUrl ? (
            <div className="flex flex-col items-center text-slate-400 gap-3">
              <div className="w-8 h-8 border-4 border-slate-600 border-t-azure-500 rounded-full animate-spin"></div>
              <p>Loading preview...</p>
            </div>
          ) : isImage ? (
            <img 
              src={fileUrl} 
              alt={file.name} 
              className="max-w-full max-h-full object-contain drop-shadow-xl"
            />
          ) : isVideo ? (
            <video 
              src={fileUrl} 
              controls 
              className="max-w-full max-h-full rounded shadow-xl"
              autoPlay
            />
          ) : isPdf ? (
            <iframe 
              src={fileUrl} 
              className="w-full h-full bg-white rounded shadow-xl border-0"
              title={file.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-4">
              <p>No preview available for this file type.</p>
              <a 
                href={fileUrl} 
                download={file.name}
                className="px-4 py-2 bg-azure-500 text-white rounded-lg hover:bg-azure-600 transition-colors shadow-raised"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
