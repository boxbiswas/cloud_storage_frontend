import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCurrentFolder } from '../../redux/slices/driveSlice';

/**
 * Breadcrumbs
 * Renders the navigation path for the current folder.
 * Clicking any crumb navigates back to that folder.
 *
 * Props:
 *   breadcrumbs  - Array of { id: string, name: string }
 *   currentFolderId - string | null (null = root)
 */
const Breadcrumbs = ({ breadcrumbs, currentFolderId }) => {
  const dispatch = useDispatch();

  const handleCrumbClick = (id) => {
    // id === null means "My Drive" root
    dispatch(setCurrentFolder(id));
  };

  return (
    <nav aria-label="Folder navigation" className="flex items-center gap-1 flex-wrap">
      {/* Root "My Drive" crumb — always present */}
      <button
        onClick={() => handleCrumbClick(null)}
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-medium
          transition-colors duration-150
          ${currentFolderId === null
            ? 'text-slate-900 font-semibold cursor-default'
            : 'text-slate-500 hover:text-azure-500 hover:bg-azure-100/40'
          }
        `}
        disabled={currentFolderId === null}
      >
        <Home size={14} />
        <span>My Drive</span>
      </button>

      {/* Dynamic crumbs from the backend breadcrumb array */}
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <React.Fragment key={crumb.id}>
            {/* Separator chevron */}
            <ChevronRight size={14} className="text-slate-300 shrink-0" />

            <button
              onClick={() => handleCrumbClick(crumb.id)}
              className={`
                px-2 py-1 rounded-lg text-sm font-medium transition-colors duration-150 max-w-[160px] truncate
                ${isLast
                  ? 'text-slate-900 font-semibold cursor-default'
                  : 'text-slate-500 hover:text-azure-500 hover:bg-azure-100/40'
                }
              `}
              disabled={isLast}
              title={crumb.name}
            >
              {crumb.name}
            </button>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
