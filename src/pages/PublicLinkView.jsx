import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLazyGetPublicLinkDetailsQuery } from '../redux/api/shareApi';
import { Lock, File, Folder, Download, Loader2, HardDrive, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PublicLinkView = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [getLinkDetails, { data, isLoading, isError, error }] = useLazyGetPublicLinkDetailsQuery();

  useEffect(() => {
    if (token) {
      getLinkDetails({ token });
    }
  }, [token, getLinkDetails]);

  useEffect(() => {
    if (isError && error?.status === 401 && error?.data?.requirePassword) {
      setIsPasswordRequired(true);
    }
  }, [isError, error]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    getLinkDetails({ token, password });
  };

  const handleDownload = () => {
    if (data?.resourceType === 'FILE' && data?.downloadUrl) {
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cloud-50 flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-azure-500 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Loading shared content...</p>
      </div>
    );
  }

  if (isError && !isPasswordRequired) {
    return (
      <div className="min-h-screen bg-cloud-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-glass border border-cloud-200 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-coral-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-coral-500" />
          </div>
          <h2 className="text-xl font-display font-semibold text-slate-900 mb-2">Unavailable</h2>
          <p className="text-slate-500 text-sm">{error?.data?.message || 'This link is invalid, expired, or has been revoked.'}</p>
        </div>
      </div>
    );
  }

  if (isPasswordRequired && (!data || isError)) {
    return (
      <div className="min-h-screen bg-cloud-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-glass border border-cloud-200 max-w-md w-full">
          <div className="w-12 h-12 bg-azure-50 rounded-full flex items-center justify-center mb-6">
            <Lock size={24} className="text-azure-500" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-slate-900 mb-2">Password Protected</h2>
          <p className="text-slate-500 text-sm mb-6">This shared link requires a password to access.</p>
          
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-cloud-50 border border-cloud-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-azure-500 transition-all"
              />
              {isError && error?.status === 401 && !error?.data?.requirePassword && (
                <p className="text-coral-500 text-xs mt-2 font-medium">{error?.data?.message || 'Incorrect password'}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-azure-500 text-white font-semibold rounded-xl hover:bg-azure-600 disabled:opacity-50 transition-colors shadow-raised flex justify-center items-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Unlock Access'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-cloud-50 flex flex-col font-body">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-cloud-200 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-azure-500 flex items-center justify-center shadow-raised">
            <HardDrive size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-slate-900 tracking-tight">CloudVault Shared File</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="bg-white border border-cloud-200 shadow-glass rounded-2xl w-full max-w-2xl overflow-hidden">
          
          {/* Resource Header */}
          <div className="p-8 flex flex-col items-center border-b border-cloud-100 bg-cloud-50/30">
            <div className="w-20 h-20 bg-cloud-100 rounded-2xl flex items-center justify-center mb-6 text-slate-500 shadow-sm">
              {data.resourceType === 'FILE' ? <File size={40} className="text-azure-500" /> : <Folder size={40} className="text-amber-500" />}
            </div>
            <h1 className="text-2xl font-display font-semibold text-slate-900 text-center mb-2">
              {data.resourceType === 'FILE' ? data.file.name : data.folder.name}
            </h1>
            <p className="text-sm text-slate-500 capitalize">
              Shared {data.resourceType.toLowerCase()}
            </p>
          </div>

          {/* Action Area */}
          <div className="p-8 flex flex-col items-center bg-white">
            {data.resourceType === 'FILE' ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-xs">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-azure-500 text-white font-semibold rounded-xl hover:bg-azure-600 transition-colors shadow-raised"
                >
                  <Download size={18} />
                  Download File
                </button>
                <span className="text-xs text-slate-400">
                  Size: {(data.file.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">Folder Contents</h3>
                  <span className="text-xs font-medium text-slate-500 bg-cloud-100 px-2 py-1 rounded-md">
                    {data.contents.files.length + data.contents.folders.length} items
                  </span>
                </div>
                
                {data.contents.folders.length === 0 && data.contents.files.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500 bg-cloud-50 rounded-xl border border-dashed border-cloud-200">
                    This folder is empty
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {data.contents.folders.map(folder => (
                      <div key={folder.id} className="flex items-center gap-3 p-3 bg-white border border-cloud-200 rounded-xl hover:border-azure-300 transition-colors">
                        <Folder size={18} className="text-amber-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate">{folder.name}</span>
                      </div>
                    ))}
                    {data.contents.files.map(file => (
                      <div key={file.id} className="flex items-center gap-3 p-3 bg-white border border-cloud-200 rounded-xl hover:border-azure-300 transition-colors">
                        <File size={18} className="text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                        <span className="text-xs text-slate-400 ml-auto shrink-0">{(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default PublicLinkView;
