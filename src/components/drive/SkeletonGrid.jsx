import React from 'react';

/**
 * SkeletonGrid
 * Displays a generic loading skeleton that mimics the FileGrid cards.
 * 
 * @param {number} count - number of skeleton cards to render (default: 8)
 */
const SkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="flex flex-col bg-white border border-cloud-100 rounded-xl p-4 shadow-sm h-32 animate-pulse"
        >
          {/* Header row: Icon & Dots */}
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-cloud-100 shrink-0" />
            <div className="w-4 h-4 rounded-full bg-cloud-100 shrink-0 mt-1" />
          </div>
          
          {/* Filename line 1 */}
          <div className="h-4 bg-cloud-200 rounded w-3/4 mb-1" />
          {/* Filename line 2 (optional wrap space) */}
          <div className="h-3 bg-cloud-100 rounded w-1/2 mb-auto" />
          
          {/* Footer row: Date / Size */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-cloud-50">
            <div className="h-2.5 bg-cloud-100 rounded w-12" />
            <div className="h-2.5 bg-cloud-100 rounded w-8" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonGrid;
