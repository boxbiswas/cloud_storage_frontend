import React from 'react';
import { X, User, ShieldAlert } from 'lucide-react';
import PermissionSelector from './PermissionSelector';

/**
 * SharedUsersList
 * Displays a list of users who have access to the resource, and the owner.
 * 
 * Props:
 *   shares   - Array of share objects [{ id, role, granteeUser: { name, email, imageUrl } }]
 *   owner    - Object representing the owner { name, email, imageUrl } (optional, you can just infer if missing)
 *   onRevoke - (shareId) => void
 *   onUpdateRole - (shareId, newRole) => void
 *   isLoading - boolean
 */
const SharedUsersList = ({ shares = [], owner, onRevoke, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 py-2">
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-cloud-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-cloud-200 rounded w-1/3"></div>
              <div className="h-2 bg-cloud-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
      {/* Owner representation (Mocked for now if not passed directly) */}
      <div className="flex items-center justify-between p-2 rounded-xl bg-cloud-50/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-azure-100 flex items-center justify-center shrink-0">
            <User size={15} className="text-azure-600" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-slate-900 truncate">
              {owner?.name || 'You'}
            </span>
            <span className="text-xs text-slate-500 truncate">
              {owner?.email || 'Owner'}
            </span>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-400 px-3">Owner</span>
      </div>

      {/* Shared Users */}
      {shares.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">No one else has access yet.</p>
      ) : (
        shares.map((share) => (
          <div key={share.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-cloud-50 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-cloud-200 flex items-center justify-center shrink-0 overflow-hidden">
                {share.granteeUser?.imageUrl ? (
                  <img src={share.granteeUser.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-semibold text-slate-500 text-xs">
                    {share.granteeUser?.name ? share.granteeUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-slate-900 truncate">
                  {share.granteeUser?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  {share.granteeUser?.email || ''}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Display role statically for simplicity, could wrap in PermissionSelector if update is needed */}
              <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded border border-cloud-200">
                {share.role === 'EDITOR' ? 'Editor' : 'Viewer'}
              </span>
              
              <button
                onClick={() => onRevoke(share.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-coral-500 hover:bg-coral-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Remove access"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SharedUsersList;
