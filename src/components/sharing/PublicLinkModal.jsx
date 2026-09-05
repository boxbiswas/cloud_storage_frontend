import React, { useState } from 'react';
import { X, Link as LinkIcon, Calendar, Lock, Copy, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateLinkShareMutation } from '../../redux/api/shareApi';

/**
 * PublicLinkModal
 * Generate public links with optional password and expiry using RTK Query.
 */
const PublicLinkModal = ({ isOpen, onClose, item, itemType }) => {
  const [generatedLink, setGeneratedLink] = useState(null);
  
  // Settings
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');

  const [createLinkShare, { isLoading: isSubmitting }] = useCreateLinkShareMutation();

  // Reset when opened
  React.useEffect(() => {
    if (isOpen) {
      setGeneratedLink(null);
      setHasExpiry(false);
      setExpiryDate('');
      setHasPassword(false);
      setPassword('');
    }
  }, [isOpen]);

  const handleCreateLink = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        resourceType: itemType.toUpperCase(),
        resourceId: item.id,
      };

      if (hasExpiry && expiryDate) {
        payload.expiresAt = new Date(expiryDate).toISOString();
      }
      
      if (hasPassword && password) {
        payload.password = password;
      }

      const response = await createLinkShare(payload).unwrap();
      const fullUrl = `${window.location.origin}/share/${response.link.token}`;
      setGeneratedLink({ ...response.link, url: fullUrl });
      toast.success('Public link generated!');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to generate link');
    }
  };

  const handleCopy = () => {
    if (generatedLink?.url) {
      navigator.clipboard.writeText(generatedLink.url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-glass-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-200 bg-cloud-50/50">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-colors">
               <X size={18} />
            </button>
            <div>
              <h2 className="text-lg font-display font-semibold text-slate-900">Public Link</h2>
              <p className="text-xs text-slate-500 mt-0.5">Anyone with the link can view</p>
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {!generatedLink ? (
            <form onSubmit={handleCreateLink} className="flex flex-col gap-5">
              
              {/* Expiry Toggle */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={hasExpiry} 
                    onChange={(e) => setHasExpiry(e.target.checked)}
                    className="w-4 h-4 text-azure-500 border-cloud-300 rounded focus:ring-azure-500"
                  />
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    <Calendar size={16} className="text-slate-400" />
                    Set Expiration Date
                  </div>
                </label>
                
                {hasExpiry && (
                  <div className="pl-7 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                      type="datetime-local"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-cloud-50 border border-cloud-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-azure-500 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Password Toggle */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={hasPassword} 
                    onChange={(e) => setHasPassword(e.target.checked)}
                    className="w-4 h-4 text-azure-500 border-cloud-300 rounded focus:ring-azure-500"
                  />
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    <Lock size={16} className="text-slate-400" />
                    Require Password
                  </div>
                </label>
                
                {hasPassword && (
                  <div className="pl-7 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                      type="text"
                      required
                      placeholder="Enter a secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-cloud-50 border border-cloud-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-azure-500 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-azure-500 text-white text-sm font-semibold rounded-xl hover:bg-azure-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-raised"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                  Generate Link
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-5 animate-in zoom-in-95 duration-300">
              <div className="flex flex-col items-center gap-3 text-center mb-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                  <LinkIcon size={24} />
                </div>
                <h3 className="text-lg font-display font-semibold text-slate-900">Link Ready!</h3>
                <p className="text-sm text-slate-500">Anyone with this link can view the item.</p>
              </div>

              <div className="flex items-center gap-2 p-1.5 bg-cloud-50 border border-cloud-200 rounded-xl">
                <input 
                  type="text" 
                  readOnly 
                  value={generatedLink.url} 
                  className="flex-1 bg-transparent px-3 py-1.5 text-sm text-slate-700 outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="p-2 bg-white rounded-lg border border-cloud-200 text-slate-600 hover:text-azure-600 hover:border-azure-300 transition-colors shadow-sm"
                  title="Copy link"
                >
                  <Copy size={16} />
                </button>
              </div>
              
              <div className="flex flex-col gap-1 mt-2 text-xs text-slate-500">
                {hasPassword && <p>• Password protection is enabled.</p>}
                {hasExpiry && <p>• Link expires on {new Date(generatedLink.expiresAt).toLocaleString()}</p>}
              </div>

              <button
                onClick={onClose}
                className="mt-2 w-full py-2.5 bg-cloud-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-cloud-200 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicLinkModal;
