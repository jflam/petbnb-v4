import React, { useState } from 'react';

interface SearchBarProps {
  onSearch: (location: string) => void;
  initialLocation?: string;
}

export default function SearchBar({ onSearch, initialLocation = '' }: SearchBarProps) {
  const [location, setLocation] = useState(initialLocation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location);
    }
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            placeholder="Enter city or ZIP code..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </div>
      </form>
    </div>
  );
}