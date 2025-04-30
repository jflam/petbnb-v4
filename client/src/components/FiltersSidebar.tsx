import React from 'react';
import { 
  FilterState, 
  ServiceOptions, 
  PetTypeOptions, 
  DogSizeOptions,
  SpecialNeedsOptions,
  HomeFeaturesOptions
} from '../types';

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

  const handleDogSizeChange = (size: string) => {
    // Toggle the size in the array of selected sizes
    const currentSizes = filters.dogSize || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    
    onFilterChange({
      ...filters,
      dogSize: newSizes.length > 0 ? newSizes : null
    });
  };

  const handleSpecialNeedsChange = (need: string) => {
    const currentNeeds = filters.specialNeeds || [];
    const newNeeds = currentNeeds.includes(need)
      ? currentNeeds.filter(n => n !== need)
      : [...currentNeeds, need];
    
    onFilterChange({
      ...filters,
      specialNeeds: newNeeds.length > 0 ? newNeeds : null
    });
  };

  const handleHomeFeaturesChange = (feature: string) => {
    const currentFeatures = filters.homeFeatures || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    onFilterChange({
      ...filters,
      homeFeatures: newFeatures.length > 0 ? newFeatures : null
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
    // Convert to number explicitly and ensure we're passing a valid value
    const distanceValue = e.target.value ? Number(e.target.value) : null;
    console.log('Setting distance filter:', distanceValue);
    
    onFilterChange({
      ...filters,
      distance: distanceValue
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

      {/* Dog Size Checkboxes instead of dropdown */}
      {(filters.petType === 'dogs' || filters.petType === null) && (
        <div className="filter-section">
          <label>Dog Size</label>
          <div className="checkbox-group">
            {DogSizeOptions.map((option) => (
              <div key={option.value} className="checkbox-item">
                <input
                  type="checkbox"
                  id={`dog-size-${option.value}`}
                  checked={(filters.dogSize || []).includes(option.value)}
                  onChange={() => handleDogSizeChange(option.value)}
                />
                <label htmlFor={`dog-size-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Needs Checkboxes */}
      <div className="filter-section">
        <label>Special Needs</label>
        <div className="checkbox-group">
          {SpecialNeedsOptions.map((option) => (
            <div key={option.value} className="checkbox-item">
              <input
                type="checkbox"
                id={`special-need-${option.value}`}
                checked={(filters.specialNeeds || []).includes(option.value)}
                onChange={() => handleSpecialNeedsChange(option.value)}
              />
              <label htmlFor={`special-need-${option.value}`}>{option.label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Home Features Checkboxes */}
      <div className="filter-section">
        <label>Home Features</label>
        <div className="checkbox-group">
          {HomeFeaturesOptions.map((option) => (
            <div key={option.value} className="checkbox-item">
              <input
                type="checkbox"
                id={`home-feature-${option.value}`}
                checked={(filters.homeFeatures || []).includes(option.value)}
                onChange={() => handleHomeFeaturesChange(option.value)}
              />
              <label htmlFor={`home-feature-${option.value}`}>{option.label}</label>
            </div>
          ))}
        </div>
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