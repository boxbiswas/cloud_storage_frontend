import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useSearchResourcesQuery } from '../redux/api/searchApi';
import SearchBar from '../components/search/SearchBar';
import FilterSortMenu from '../components/search/FilterSortMenu';
import FileGrid from '../components/drive/FileGrid';
import SkeletonGrid from '../components/drive/SkeletonGrid';

/**
 * Search Page
 * Displays search results based on the URL query parameters using RTK Query.
 */
const Search = () => {
  const [searchParams] = useSearchParams();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Track cursor for pagination
  const [cursor, setCursor] = useState(undefined);
  
  // Reset cursor whenever URL params (search/filters) change
  React.useEffect(() => {
    setCursor(undefined);
  }, [searchParams]);

  // Extract params from URL
  const queryParams = {
    q: searchParams.get('q') || undefined,
    type: searchParams.get('type') || undefined,
    owner: searchParams.get('owner') || undefined,
    sort: searchParams.get('sort') || undefined,
    order: searchParams.get('order') || undefined,
    cursor: cursor,
  };

  // Fetch results via RTK Query
  const { data, isLoading, isFetching, isError } = useSearchResourcesQuery(queryParams, {
    skip: !queryParams.q && !queryParams.type && !queryParams.owner, // skip fetch if entirely empty
  });

  const results = data?.data || { folders: [], files: [] };
  const pagination = data?.pagination || {};

  const loadMore = () => {
    // Determine which cursor to use (prefer file cursor, else folder cursor)
    const nextCursor = pagination.nextFileCursor || pagination.nextFolderCursor;
    if (nextCursor) {
      setCursor(nextCursor);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      
      {/* Top Search Area */}
      <div className="px-6 pt-6 pb-4 border-b border-cloud-200 bg-white z-20 shadow-sm shrink-0">
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-4">Search</h1>
        <SearchBar 
          isFiltersOpen={isFiltersOpen} 
          onToggleFilters={() => setIsFiltersOpen(!isFiltersOpen)} 
        />
        <FilterSortMenu isOpen={isFiltersOpen} />
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 bg-cloud-50/50">
        
        {isLoading && !data ? (
          <SkeletonGrid count={12} />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <p className="font-body font-medium text-coral-500">Failed to load search results.</p>
          </div>
        ) : (!queryParams.q && !queryParams.type && !queryParams.owner) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cloud-100 flex items-center justify-center mb-4">
              <SearchIcon size={28} className="text-slate-300" />
            </div>
            <p className="font-body font-medium text-slate-500">Enter a search term</p>
          </div>
        ) : (results.folders.length === 0 && results.files.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cloud-100 flex items-center justify-center mb-4">
              <SearchIcon size={28} className="text-slate-300" />
            </div>
            <p className="font-body font-medium text-slate-500">No results found</p>
            <p className="font-body text-sm text-slate-400 mt-1">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm font-medium text-slate-500">
              Found {results.folders.length + results.files.length} results
            </p>
            
            <FileGrid 
              folders={results.folders} 
              files={results.files} 
              selectedIds={[]} 
              onFolderOpen={() => {}} 
            />

            {(pagination.nextFileCursor || pagination.nextFolderCursor) ? (
              <div className="flex justify-center pt-8 pb-4">
                <button
                  onClick={loadMore}
                  disabled={isFetching}
                  className="px-6 py-2.5 bg-white border border-cloud-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-cloud-50 hover:border-azure-300 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isFetching && <Loader2 size={16} className="animate-spin text-azure-500" />}
                  {isFetching ? 'Loading...' : 'Load More'}
                </button>
              </div>
            ) : (results.folders.length > 0 || results.files.length > 0) && (
              <div className="flex justify-center pt-8 pb-4">
                <p className="text-sm font-medium text-slate-400">No more results</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
