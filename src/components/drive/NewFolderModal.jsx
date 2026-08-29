import React, { useState, useEffect, useRef } from 'react';
import { X, FolderPlus } from 'lucide-react';

/**
 * NewFolderModal
 * A modal dialog for creating a new folder.
 *
 * Props:
 *   isOpen      - boolean
 *   onClose     - () => void
 *   onCreate    - (name: string) => Promise<void>
 *   isLoading   - boolean  (disable button while API call is in flight)
 */
const NewFolderModal = ({ isOpen, onClose, onCreate, isLoading }) => {
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  // Focus the input when the modal opens
  useEffect(() => {
    if (isOpen) {
      setName('Untitled folder');
      setTimeout(() => {
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await onCreate(trimmed);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-xs"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal Card */}
      <div className="bg-white rounded-xl2 shadow-glass-lg border border-cloud-200 w-full max-w-sm mx-4 p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-azure-100 flex items-center justify-center">
              <FolderPlus size={16} className="text-azure-500" />
            </div>
            <h2 className="font-display font-semibold text-slate-900 text-base">New Folder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Folder name"
            maxLength={255}
            className="
              w-full px-3.5 py-2.5 rounded-xl border border-cloud-200
              font-body text-sm text-slate-900 placeholder:text-slate-400
              bg-cloud-50 focus:outline-none focus:ring-2 focus:ring-azure-500/30 focus:border-azure-500
              transition-all duration-150
            "
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-cloud-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-azure-500 text-white
                hover:bg-azure-600 active:scale-95 transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFolderModal;
