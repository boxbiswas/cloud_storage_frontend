import React, { useRef, useEffect } from 'react';
import { Pencil, Trash2, FolderInput, Share2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { closeContextMenu } from '../../redux/slices/driveSlice';

/**
 * ContextMenu
 * A floating right-click context menu for files and folders.
 * Positioned absolutely at (x, y) based on where the user right-clicked.
 * Closes when clicking outside or pressing Escape.
 *
 * Props:
 *   menu        - { x, y, item, itemType: 'folder' | 'file' } from Redux state
 *   onRename    - (item, itemType) => void
 *   onDelete    - (item, itemType) => void
 *   onMove      - (item, itemType) => void
 */
const ContextMenu = ({ menu, onRename, onDelete, onMove }) => {
  const dispatch = useDispatch();
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        dispatch(closeContextMenu());
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') dispatch(closeContextMenu());
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [dispatch]);

  if (!menu) return null;

  // Prevent menu from overflowing the viewport
  const style = {
    position: 'fixed',
    top: Math.min(menu.y, window.innerHeight - 180),
    left: Math.min(menu.x, window.innerWidth - 200),
    zIndex: 9999,
  };

  const menuItem = (icon, label, onClick, danger = false) => (
    <button
      key={label}
      onClick={() => { onClick(); dispatch(closeContextMenu()); }}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md
        transition-colors duration-100 text-left
        ${danger
          ? 'text-coral-500 hover:bg-coral-500/10'
          : 'text-slate-700 hover:bg-cloud-100 hover:text-slate-900'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div
      ref={menuRef}
      style={style}
      className="bg-white/90 backdrop-blur-glass border border-cloud-200 rounded-xl shadow-glass-md p-1.5 w-48 animate-in fade-in zoom-in-95 duration-100"
    >
      {menuItem(<Pencil size={14} />, 'Rename', () => onRename(menu.item, menu.itemType))}
      {menuItem(<FolderInput size={14} />, 'Move', () => onMove(menu.item, menu.itemType))}
      
      {/* Divider */}
      <div className="my-1 border-t border-cloud-200" />

      {menuItem(<Trash2 size={14} />, 'Delete', () => onDelete(menu.item, menu.itemType), true)}
    </div>
  );
};

export default ContextMenu;
