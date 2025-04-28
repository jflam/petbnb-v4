import React, { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import FiltersSidebar from './components/FiltersSidebar';
import SitterGrid from './components/SitterGrid';
import { Sitter, SearchQuery, FilterState, SearchResponse } from './types';

export default function App() {
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<string>('Seattle, WA');
  const [filters, setFilters] = useState<FilterState>({
    minPrice: null,
    maxPrice: null,
    minRating: null,
    service: null,
    petType: null,
    dogSize: null,
    distance: null,
    topSittersOnly: false
  });

  const fetchSitters = async (query: SearchQuery = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      
      if (query.location) params.append('location', query.location);
      if (query.minPrice) params.append('minPrice', query.minPrice.toString());
      if (query.maxPrice) params.append('maxPrice', query.maxPrice.toString());
      if (query.minRating) params.append('minRating', query.minRating.toString());
      if (query.service) params.append('service', query.service);
      if (query.petType) params.append('petType', query.petType);
      if (query.dogSize) params.append('dogSize', query.dogSize);
      if (query.distance) params.append('distance', query.distance.toString());
      if (query.topSittersOnly) params.append('topSittersOnly', 'true');
      
      const queryString = params.toString();
      const endpoint = `/api/v1/sitters/search${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sitters');
      }
      
      const data: SearchResponse = await response.json();
      setSitters(data.sitters);
    } catch (e: any) {
      setError(e.message);
      setSitters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (location: string) => {
    setSearchLocation(location);
    fetchSitters({ location, ...filters });
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    fetchSitters({ location: searchLocation, ...newFilters });
  };

  const handleResetFilters = () => {
    const resetFilters: FilterState = {
      minPrice: null,
      maxPrice: null,
      minRating: null,
      service: null,
      petType: null,
      dogSize: null,
      distance: null,
      topSittersOnly: false
    };
    setFilters(resetFilters);
    fetchSitters({ location: searchLocation });
  };

  const handleSitterSelect = (sitterId: number) => {
    // In a real app, this would navigate to the sitter detail page
    alert(`Navigating to sitter ${sitterId} details page`);
  };

  useEffect(() => {
    fetchSitters();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">
          <span role="img" aria-label="pet">🐾</span> PetBnB
        </div>
        <SearchBar onSearch={handleSearch} initialLocation={searchLocation} />
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
          <div className="search-results-header">
            <h2>Sitters near {searchLocation}</h2>
            {!isLoading && !error && (
              <p>{sitters.length} {sitters.length === 1 ? 'sitter' : 'sitters'} found</p>
            )}
          </div>
          
          <SitterGrid 
            sitters={sitters} 
            isLoading={isLoading} 
            error={error} 
            onSitterSelect={handleSitterSelect} 
          />
        </section>
      </main>
    </div>
  );
}