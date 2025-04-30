import React from 'react';
import ViewToggle from './ViewToggle';
import SortDropdown from './SortDropdown';

interface SearchResultsHeaderProps {
  location: string;
  count: number;
  isLoading: boolean;
  error: string | null;
  currentView: 'list' | 'map';
  currentSort: 'distance' | 'price' | 'rating';
  onViewToggle: (view: 'list' | 'map') => void;
  onSortChange: (sort: 'distance' | 'price' | 'rating') => void;
}

export default function SearchResultsHeader({
  location,
  count,
  isLoading,
  error,
  currentView,
  currentSort,
  onViewToggle,
  onSortChange
}: SearchResultsHeaderProps) {
  return (
    <div className="search-results-header">
      <div className="search-results-info">
        <h2>Sitters near {location}</h2>
        {!isLoading && !error && (
          <p>{count} {count === 1 ? 'sitter' : 'sitters'} found</p>
        )}
      </div>
      
      <div className="search-results-controls">
        <SortDropdown currentSort={currentSort} onSortChange={onSortChange} />
        <ViewToggle currentView={currentView} onToggle={onViewToggle} />
      </div>
    </div>
  );
}