import React, { useState, useCallback, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import debounce from 'lodash.debounce';

interface SearchLocation {
  locationLabel: string;
  latitude: number;
  longitude: number;
}

interface SearchBarProps {
  onSearch: (params: {
    location: string;
    latitude: number;
    longitude: number;
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  initialLocation?: string;
  initialLatitude?: number;
  initialLongitude?: number;
}

export default function SearchBar({ 
  onSearch, 
  initialLocation = '', 
  initialLatitude, 
  initialLongitude 
}: SearchBarProps) {
  const [locationText, setLocationText] = useState(initialLocation);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [suggestions, setSuggestions] = useState<SearchLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SearchLocation | null>(
    initialLatitude && initialLongitude
      ? {
          locationLabel: initialLocation,
          latitude: initialLatitude,
          longitude: initialLongitude
        }
      : null
  );
  
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchGeocodingSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch geocoding suggestions');
        }
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching geocoding suggestions:', error);
      }
    }, 300),
    []
  );

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setLocationText(query);
    fetchGeocodingSuggestions(query);
  };

  const handleSuggestionSelect = (suggestion: SearchLocation) => {
    setLocationText(suggestion.locationLabel);
    setSelectedLocation(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationText.trim()) return;
    
    onSearch({
      location: locationText,
      latitude: selectedLocation?.latitude || 0,
      longitude: selectedLocation?.longitude || 0,
      startDate,
      endDate
    });
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="search-container">
          <div className="location-container">
            <input
              type="text"
              className="search-input"
              placeholder="Enter city or ZIP code..."
              value={locationText}
              onChange={handleLocationChange}
              onFocus={() => locationText.length >= 3 && setShowSuggestions(true)}
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-dropdown" ref={suggestionsRef}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    {suggestion.locationLabel}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="date-range-container">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={new Date()}
              placeholderText="Check in"
              className="date-input"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="Check out"
              className="date-input"
            />
          </div>
          
          <button type="submit" className="search-button">
            Search
          </button>
        </div>
      </form>
    </div>
  );
}