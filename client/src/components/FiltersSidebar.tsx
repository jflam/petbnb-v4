import React from 'react';
import { FilterState, ServiceOptions, PetTypeOptions, DogSizeOptions } from '../types';

interface FiltersSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export default function FiltersSidebar({
  filters,
  onFilterChange,
  onResetFilters
}: FiltersSidebarProps) {
  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      service: e.target.value || null
    });
  };

  const handlePetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      petType: e.target.value || null
    });
  };

  const handleDogSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      dogSize: e.target.value || null
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      maxPrice: e.target.value ? Number(e.target.value) : null
    });
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      minRating: e.target.value ? Number(e.target.value) : null
    });
  };

  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      distance: e.target.value ? Number(e.target.value) : null
    });
  };

  const handleTopSittersToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      topSittersOnly: e.target.checked
    });
  };

  return (
    <div className="filters-sidebar">
      <div className="filter-section">
        <h3>Filters</h3>
        <button className="reset-filters-button" onClick={onResetFilters}>
          Reset Filters
        </button>
      </div>

      <div className="filter-section">
        <label htmlFor="service-filter">Service Type</label>
        <select
          id="service-filter"
          className="filter-select"
          value={filters.service || ''}
          onChange={handleServiceChange}
        >
          <option value="">All Services</option>
          {ServiceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="pet-type-filter">Pet Type</label>
        <select
          id="pet-type-filter"
          className="filter-select"
          value={filters.petType || ''}
          onChange={handlePetTypeChange}
        >
          <option value="">All Pets</option>
          {PetTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="dog-size-filter">Dog Size</label>
        <select
          id="dog-size-filter"
          className="filter-select"
          value={filters.dogSize || ''}
          onChange={handleDogSizeChange}
          disabled={filters.petType !== 'dogs' && filters.petType !== null}
        >
          <option value="">All Sizes</option>
          {DogSizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="price-filter">Max Price ($ per night)</label>
        <input
          id="price-filter"
          type="range"
          min="20"
          max="100"
          step="5"
          value={filters.maxPrice || 100}
          onChange={handlePriceChange}
          className="filter-slider"
        />
        <div className="price-display">${filters.maxPrice || 100}</div>
      </div>

      <div className="filter-section">
        <label htmlFor="rating-filter">Minimum Rating</label>
        <select
          id="rating-filter"
          className="filter-select"
          value={filters.minRating || ''}
          onChange={handleRatingChange}
        >
          <option value="">Any Rating</option>
          <option value="3">3+ Stars</option>
          <option value="3.5">3.5+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="5">5 Stars</option>
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="distance-filter">Maximum Distance (miles)</label>
        <input
          id="distance-filter"
          type="range"
          min="1"
          max="50"
          step="1"
          value={filters.distance || 50}
          onChange={handleDistanceChange}
          className="filter-slider"
        />
        <div className="distance-display">{filters.distance || 50} miles</div>
      </div>

      <div className="filter-section checkbox-section">
        <input
          id="top-sitters"
          type="checkbox"
          checked={filters.topSittersOnly}
          onChange={handleTopSittersToggle}
        />
        <label htmlFor="top-sitters">Top Sitters Only</label>
      </div>
    </div>
  );
}