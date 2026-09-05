import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

const DeleteModal = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  item, 
  itemType, 
  isLoading,
  title = "Move to Trash?",
  description,
  confirmText = "Move to Trash"
}) => {
  if (!isOpen) return null;

  const defaultDescription = item 
    ? `Are you sure you want to move "${item.name}" to the trash? You can restore it later if needed.`
    : "Are you sure you want to delete this?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-glass-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-coral-50 flex items-center justify-center">
            <Trash2 size={24} className="text-coral-500" />
          </div>
          
          <div>
            <h3 className="text-lg font-display font-semibold text-slate-900">
              {title}
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              {description || defaultDescription}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-cloud-50 text-slate-700 text-sm font-semibold rounded-xl hover:bg-cloud-100 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(item, itemType)}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-coral-500 text-white text-sm font-semibold rounded-xl hover:bg-coral-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
