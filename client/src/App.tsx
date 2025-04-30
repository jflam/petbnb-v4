import React, { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import FiltersSidebar from './components/FiltersSidebar';
import SitterGrid from './components/SitterGrid';
import SearchResultsHeader from './components/SearchResultsHeader';
import MapView from './components/MapView';
import { Sitter, SearchQuery, FilterState, SearchResponse } from './types';
import './App.css';

export default function App() {
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Seattle coordinates for Pike Place Market
  const [searchLocation, setSearchLocation] = useState<string>('Seattle, WA');
  const [searchCoords, setSearchCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 47.6097,
    longitude: -122.3422
  });
  const [searchDates, setSearchDates] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null
  });
  const [filters, setFilters] = useState<FilterState>({
    minPrice: null,
    maxPrice: null,
    minRating: null,
    service: null,
    petType: null,
    dogSize: null,
    distance: 50, // Set a default distance of 50 miles
    topSittersOnly: false,
    specialNeeds: null,
    homeFeatures: null,
    sort: 'distance',
    view: 'list'
  });

  const fetchSitters = async (query: SearchQuery = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      
      if (query.location) params.append('location', query.location);
      if (query.latitude) params.append('latitude', query.latitude.toString());
      if (query.longitude) params.append('longitude', query.longitude.toString());
      if (query.minPrice) params.append('minPrice', query.minPrice.toString());
      if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString());
      if (query.minRating) params.append('minRating', query.minRating.toString());
      if (query.service) params.append('service', query.service);
      if (query.petType) params.append('petType', query.petType);
      
      // Handle dog size arrays
      if (query.dogSize && Array.isArray(query.dogSize) && query.dogSize.length > 0) {
        query.dogSize.forEach(size => params.append('dogSize', size));
      } else if (query.dogSize && typeof query.dogSize === 'string') {
        params.append('dogSize', query.dogSize);
      }
      
      // Handle special needs arrays
      if (query.specialNeeds && Array.isArray(query.specialNeeds) && query.specialNeeds.length > 0) {
        query.specialNeeds.forEach(need => params.append('specialNeeds', need));
      }
      
      // Handle home features arrays
      if (query.homeFeatures && Array.isArray(query.homeFeatures) && query.homeFeatures.length > 0) {
        query.homeFeatures.forEach(feature => params.append('homeFeatures', feature));
      }
      
      // IMPORTANT - FIX: Make sure distance filter is included
      // Debug distance value:
      console.log('Distance filter value:', query.distance);
      
      // Check for undefined, null, or empty string
      if (query.distance !== undefined && query.distance !== null) {
        params.append('distance', query.distance.toString());
      }
      
      if (query.topSittersOnly) params.append('topSittersOnly', 'true');
      if (query.sort) params.append('sort', query.sort);
      
      // Add date range if provided
      if (query.startDate) params.append('startDate', query.startDate.toString());
      if (query.endDate) params.append('endDate', query.endDate.toString());
      
      const queryString = params.toString();
      const endpoint = `/api/v1/sitters/search${queryString ? `?${queryString}` : ''}`;
      
      console.log('Fetching sitters with query:', queryString);
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sitters');
      }
      
      const data: SearchResponse = await response.json();
      setSitters(data.sitters);
      
      // Update search coordinates with the returned coordinates from API
      if (data.query && data.query.latitude && data.query.longitude) {
        setSearchCoords({
          latitude: data.query.latitude,
          longitude: data.query.longitude
        });
      }
    } catch (e: any) {
      setError(e.message);
      setSitters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params: {
    location: string; 
    latitude: number; 
    longitude: number;
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    const { location, latitude, longitude, startDate, endDate } = params;
    
    setSearchLocation(location);
    setSearchCoords({ latitude, longitude });
    setSearchDates({ startDate, endDate });
    
    fetchSitters({ 
      location, 
      latitude, 
      longitude,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      ...filters 
    });
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    
    fetchSitters({ 
      location: searchLocation, 
      ...searchCoords,
      startDate: searchDates.startDate ? searchDates.startDate.toISOString() : null,
      endDate: searchDates.endDate ? searchDates.endDate.toISOString() : null,
      ...newFilters 
    });
  };

  const handleResetFilters = () => {
    const resetFilters: FilterState = {
      minPrice: null,
      maxPrice: null,
      minRating: null,
      service: null,
      petType: null,
      dogSize: null,
      distance: 50, // Keep default distance of 50 miles
      topSittersOnly: false,
      specialNeeds: null,
      homeFeatures: null,
      sort: 'distance',
      view: filters.view // Keep the current view
    };
    setFilters(resetFilters);
    
    fetchSitters({ 
      location: searchLocation,
      ...searchCoords,
      startDate: searchDates.startDate ? searchDates.startDate.toISOString() : null,
      endDate: searchDates.endDate ? searchDates.endDate.toISOString() : null 
    });
  };

  const handleSitterSelect = (sitterId: number) => {
    // In a real app, this would navigate to the sitter detail page
    alert(`Navigating to sitter ${sitterId} details page`);
  };

  const handleViewToggle = (view: 'list' | 'map') => {
    setFilters(prev => ({ ...prev, view }));
  };

  const handleSortChange = (sort: 'distance' | 'price' | 'rating') => {
    const newFilters = { ...filters, sort };
    setFilters(newFilters);
    
    fetchSitters({ 
      location: searchLocation, 
      ...searchCoords,
      startDate: searchDates.startDate ? searchDates.startDate.toISOString() : null,
      endDate: searchDates.endDate ? searchDates.endDate.toISOString() : null,
      ...newFilters 
    });
  };

  const handleMapMoved = (center: { lng: number, lat: number }) => {
    // Update the search coordinates and refetch sitters
    const newCoords = { latitude: center.lat, longitude: center.lng };
    setSearchCoords(newCoords);
    
    // Optional: could also use the Geocoding API to reverse geocode these coordinates
    // and update the searchLocation with a proper name
    
    fetchSitters({ 
      location: searchLocation, 
      ...newCoords,
      startDate: searchDates.startDate ? searchDates.startDate.toISOString() : null,
      endDate: searchDates.endDate ? searchDates.endDate.toISOString() : null,
      ...filters 
    });
  };

  // We'll no longer do initial fetch here since SearchBar will trigger it
  // This avoids double-fetching at startup

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span role="img" aria-label="pet">🐾</span> PetBnB
        </div>
        <SearchBar 
          onSearch={handleSearch} 
          initialLocation={searchLocation}
          initialLatitude={searchCoords.latitude}
          initialLongitude={searchCoords.longitude}
        />
        <div className="header-right">
          <button className="auth-button">Login / Register</button>
        </div>
      </header>
      
      <main className="app-main">
        <aside className="app-sidebar">
          <FiltersSidebar 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onResetFilters={handleResetFilters} 
          />
        </aside>
        
        <section className="app-content">
          <SearchResultsHeader
            location={searchLocation}
            count={sitters.length}
            isLoading={isLoading}
            error={error}
            currentView={filters.view}
            currentSort={filters.sort}
            onViewToggle={handleViewToggle}
            onSortChange={handleSortChange}
          />
          
          {filters.view === 'list' ? (
            <SitterGrid 
              sitters={sitters} 
              isLoading={isLoading} 
              error={error} 
              onSitterSelect={handleSitterSelect} 
            />
          ) : (
            <MapView
              sitters={sitters}
              latitude={searchCoords.latitude}
              longitude={searchCoords.longitude}
              onSitterSelect={handleSitterSelect}
              onMapMoved={handleMapMoved}
              filteredSitters={sitters} // All sitters shown normally when no filtering is active
            />
          )}
        </section>
      </main>
    </div>
  );
}