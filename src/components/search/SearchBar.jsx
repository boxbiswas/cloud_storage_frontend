import React, { useState, useEffect, useRef } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * SearchBar
 * A debounced search input that updates the URL with query parameters.
 * Can also toggle the visibility of the advanced Filter/Sort menu.
 */
const SearchBar = ({ onToggleFilters, isFiltersOpen }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Initialize local state from URL query
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const debounceTimer = useRef(null);

  // Sync state if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams.get('q')]);

  // Handle typing with debounce
  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      // Create new params based on current URL params
      const newParams = new URLSearchParams(searchParams);
      if (val) {
        newParams.set('q', val);
      } else {
        newParams.delete('q');
      }
      
      // Navigate to /search with the new params
      navigate(`/search?${newParams.toString()}`);
    }, 400); // 400ms debounce
  };

  const handleClear = () => {
    setQuery('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    navigate(`/search?${newParams.toString()}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('q', query);
    } else {
      newParams.delete('q');
    }
    navigate(`/search?${newParams.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full max-w-2xl">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-slate-400" />
      </div>
      
      <input
        type="text"
        placeholder="Search files and folders..."
        value={query}
        onChange={handleChange}
        className="w-full pl-10 pr-20 py-2.5 bg-cloud-100 hover:bg-cloud-200 focus:bg-white border border-transparent focus:border-azure-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-azure-500/10 transition-all shadow-sm"
      />
      
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={onToggleFilters}
          className={`p-1.5 rounded-md transition-colors ${isFiltersOpen ? 'bg-azure-100 text-azure-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          title="Advanced filters"
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
