import React from 'react';
import { SortOptions } from '../types';

interface SortDropdownProps {
  currentSort: 'distance' | 'price' | 'rating';
  onSortChange: (sort: 'distance' | 'price' | 'rating') => void;
}

export default function SortDropdown({ currentSort, onSortChange }: SortDropdownProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange(e.target.value as 'distance' | 'price' | 'rating');
  };

  return (
    <div className="sort-dropdown">
      <label htmlFor="sort-select">Sort by:</label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleChange}
        className="sort-select"
      >
        {SortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}