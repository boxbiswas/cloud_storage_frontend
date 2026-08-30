import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * FilterSortMenu
 * An inline menu that appears below the SearchBar to configure filters and sorting.
 * Updates the URL query parameters instantly.
 */
const FilterSortMenu = ({ isOpen }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    navigate(`/search?${newParams.toString()}`);
  };

  return (
    <div className="w-full max-w-2xl bg-white border border-cloud-200 rounded-xl shadow-glass-sm p-4 mt-2 animate-in fade-in slide-in-from-top-2 duration-200 grid grid-cols-2 md:grid-cols-4 gap-4 z-10 relative">
      
      {/* Type Filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
        <select 
          value={searchParams.get('type') || ''} 
          onChange={(e) => updateParam('type', e.target.value)}
          className="text-sm bg-cloud-50 border border-cloud-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-azure-500"
        >
          <option value="">Any type</option>
          <option value="folder">Folders</option>
          <option value="pdf">PDFs</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
        </select>
      </div>

      {/* Owner Filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</label>
        <select 
          value={searchParams.get('owner') || ''} 
          onChange={(e) => updateParam('owner', e.target.value)}
          className="text-sm bg-cloud-50 border border-cloud-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-azure-500"
        >
          <option value="">Anyone</option>
          <option value="me">Owned by me</option>
        </select>
      </div>

      {/* Sort Field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort by</label>
        <select 
          value={searchParams.get('sort') || 'createdAt'} 
          onChange={(e) => updateParam('sort', e.target.value)}
          className="text-sm bg-cloud-50 border border-cloud-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-azure-500"
        >
          <option value="createdAt">Date modified</option>
          <option value="name">Name</option>
          <option value="sizeBytes">Size</option>
        </select>
      </div>

      {/* Sort Order */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</label>
        <select 
          value={searchParams.get('order') || 'desc'} 
          onChange={(e) => updateParam('order', e.target.value)}
          className="text-sm bg-cloud-50 border border-cloud-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-azure-500"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>
      
    </div>
  );
};

export default FilterSortMenu;
