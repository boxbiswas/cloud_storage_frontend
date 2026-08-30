import React, { useState } from 'react';
import { X, Folder, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetFolderContentsQuery } from '../../redux/api/folderApi';

const FolderNode = ({ folderId, folderName, depth = 0, selectedId, onSelect, disableIds = [], skipFetch = false }) => {
  const [isExpanded, setIsExpanded] = useState(depth === 0); // Auto-expand root

  // We only fetch if it's expanded or it's the root to save bandwidth
  const { data, isLoading } = useGetFolderContentsQuery(folderId, {
    skip: !isExpanded && !skipFetch,
  });

  const folders = data?.children?.folders || data?.folders || [];
  
  const isDisabled = disableIds.includes(folderId);
  const isSelected = selectedId === folderId;

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    if (!isDisabled) {
      onSelect(folderId);
    }
  };

  return (
    <div className="flex flex-col">
      <div 
        onClick={handleSelect}
        className={`
          flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors
          ${isSelected ? 'bg-azure-100 text-azure-700' : 'hover:bg-cloud-100 text-slate-700'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed bg-cloud-50 text-slate-400' : ''}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <div 
          onClick={handleToggle}
          className="w-5 h-5 flex items-center justify-center rounded hover:bg-cloud-200 cursor-pointer shrink-0"
        >
          {isLoading ? (
            <Loader2 size={12} className="animate-spin text-slate-400" />
          ) : (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          )}
        </div>
        <Folder size={16} className={isSelected && !isDisabled ? 'text-azure-500' : 'text-slate-400'} fill={isSelected && !isDisabled ? 'currentColor' : 'none'} />
        <span className="text-sm font-medium truncate">{folderName}</span>
      </div>

      {isExpanded && (
        <div className="flex flex-col mt-0.5">
          {folders.map(f => (
            <FolderNode 
              key={f.id}
              folderId={f.id}
              folderName={f.name}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              disableIds={disableIds}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * MoveModal
 * A modal for moving items with a recursive folder tree.
 */
const MoveModal = ({ isOpen, onClose, item, itemType, onMoveCommit, isLoading }) => {
  const [selectedFolderId, setSelectedFolderId] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedFolderId(null);
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  // We want to prevent moving a folder into itself or any of its descendants.
  // Because we do lazy fetching, we can't easily know all descendants synchronously,
  // but at minimum we can disable the item itself and its immediate parent.
  // The backend will enforce cycle prevention.
  const disabledIds = itemType === 'folder' ? [item.id] : [];

  const handleCommit = () => {
    if (selectedFolderId !== null) {
      onMoveCommit(selectedFolderId, item, itemType);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-glass-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cloud-200 bg-cloud-50/50">
          <div>
            <h2 className="text-lg font-display font-semibold text-slate-900">Move "{item.name}"</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select a destination folder</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-cloud-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tree Area */}
        <div className="p-2 overflow-y-auto flex-1 bg-white min-h-[300px]">
          <FolderNode 
            folderId="root"
            folderName="My Drive"
            selectedId={selectedFolderId}
            onSelect={setSelectedFolderId}
            disableIds={disabledIds}
            skipFetch={true}
          />
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-cloud-200 bg-cloud-50/50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-cloud-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCommit}
            disabled={isLoading || selectedFolderId === null}
            className="px-4 py-2 bg-azure-500 text-white text-sm font-semibold rounded-xl hover:bg-azure-600 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-raised"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            Move Here
          </button>
        </div>

      </div>
    </div>
  );
};

export default MoveModal;
