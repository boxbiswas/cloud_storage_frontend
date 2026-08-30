import React, { useState, useEffect } from 'react';
import { X, UserPlus, Link as LinkIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  useGetSharesQuery, 
  useCreateShareMutation, 
  useDeleteShareMutation 
} from '../../redux/api/shareApi';
import PermissionSelector from './PermissionSelector';
import SharedUsersList from './SharedUsersList';
import PublicLinkModal from './PublicLinkModal';

/**
 * ShareModal
 * Manage sharing for a file or folder using RTK Query.
 */
const ShareModal = ({ isOpen, onClose, item, itemType }) => {
  const [emailInput, setEmailInput] = useState('');
  const [selectedRole, setSelectedRole] = useState('VIEWER');
  
  const [isPublicLinkOpen, setIsPublicLinkOpen] = useState(false);

  // RTK Query: fetch shares for this item when modal is open
  const skipQuery = !isOpen || !item;
  const { 
    data: shares = [], 
    isLoading 
  } = useGetSharesQuery(
    { resourceType: itemType?.toUpperCase(), resourceId: item?.id },
    { skip: skipQuery }
  );

  const [createShare, { isLoading: isSubmitting }] = useCreateShareMutation();
  const [deleteShare] = useDeleteShareMutation();

  useEffect(() => {
    if (isOpen && item) {
      setEmailInput('');
      setSelectedRole('VIEWER');
    }
  }, [isOpen, item]);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    try {
      await createShare({
        resourceType: itemType.toUpperCase(),
        resourceId: item.id,
        granteeEmail: emailInput.trim(),
        role: selectedRole
      }).unwrap();
      
      toast.success(`Shared with ${emailInput}`);
      setEmailInput('');
    } catch (err) {
      toast.error(err.data?.message || 'Failed to share resource');
    }
  };

  const handleRevoke = async (shareId) => {
    try {
      await deleteShare(shareId).unwrap();
      toast.success('Access revoked');
    } catch (err) {
      toast.error('Failed to revoke access');
    }
  };

  if (!isOpen || !item) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-glass-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-200 bg-cloud-50/50">
            <div>
              <h2 className="text-lg font-display font-semibold text-slate-900">Share "{item.name}"</h2>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">{itemType}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-6">
            
            {/* Invite Form */}
            <form onSubmit={handleShare} className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Add people</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserPlus size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-cloud-50 border border-cloud-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-azure-500 focus:bg-white transition-all"
                  />
                </div>
                <PermissionSelector value={selectedRole} onChange={setSelectedRole} disabled={isSubmitting} />
              </div>
              <div className="flex justify-end mt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || !emailInput.trim()}
                  className="px-4 py-2 bg-azure-500 text-white text-sm font-semibold rounded-xl hover:bg-azure-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-raised"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  Share
                </button>
              </div>
            </form>

            {/* Public Link Section */}
            <div>
              <button 
                onClick={() => setIsPublicLinkOpen(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-cloud-200 hover:border-azure-300 hover:bg-azure-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cloud-100 group-hover:bg-azure-100 flex items-center justify-center transition-colors">
                    <LinkIcon size={16} className="text-slate-500 group-hover:text-azure-600" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium text-slate-900">Get Public Link</span>
                    <span className="text-xs text-slate-500">Anyone with the link can view</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-azure-600 bg-azure-100 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  Create
                </span>
              </button>
            </div>

            <hr className="border-cloud-200" />

            {/* People with access */}
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-slate-700">People with access</h3>
              <SharedUsersList 
                shares={shares} 
                onRevoke={handleRevoke}
                isLoading={isLoading} 
              />
            </div>
            
          </div>
        </div>
      </div>

      {/* Nested Public Link Modal */}
      <PublicLinkModal 
        isOpen={isPublicLinkOpen} 
        onClose={() => setIsPublicLinkOpen(false)} 
        item={item} 
        itemType={itemType} 
      />
    </>
  );
};

export default ShareModal;
