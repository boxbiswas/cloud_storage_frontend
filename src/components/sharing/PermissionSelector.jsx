import React from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * PermissionSelector
 * A simple dropdown to select Viewer or Editor roles.
 * 
 * Props:
 *   value    - 'VIEWER' | 'EDITOR'
 *   onChange - (newRole) => void
 *   disabled - boolean
 */
const PermissionSelector = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles = [
    { id: 'VIEWER', label: 'Viewer', desc: 'Can view and download' },
    { id: 'EDITOR', label: 'Editor', desc: 'Can edit, rename, move, and delete' },
  ];

  const currentRole = roles.find(r => r.id === value) || roles[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-cloud-50 hover:bg-cloud-100 transition-colors disabled:opacity-50 border border-cloud-200"
      >
        {currentRole.label}
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-cloud-200 rounded-xl shadow-glass-md py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => { onChange(role.id); setIsOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-cloud-50 flex items-start gap-2 transition-colors"
            >
              <div className="mt-0.5 w-4 flex justify-center">
                {value === role.id && <Check size={14} className="text-azure-500" />}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${value === role.id ? 'text-slate-900' : 'text-slate-700'}`}>
                  {role.label}
                </span>
                <span className="text-xs text-slate-500 mt-0.5 leading-tight">
                  {role.desc}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionSelector;
