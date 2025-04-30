import React, { useState, useCallback, useEffect, useRef, KeyboardEvent } from 'react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [suggestions]);
  
  // Initialize with default location and trigger initial search
  useEffect(() => {
    if (initialLocation && initialLatitude && initialLongitude) {
      console.log('Initializing search with:', initialLocation, initialLatitude, initialLongitude);
      // Make sure we have the initial location set properly
      setLocationText(initialLocation);
      setSelectedLocation({
        locationLabel: initialLocation,
        latitude: initialLatitude,
        longitude: initialLongitude
      });
      
      // Trigger initial search with default location
      onSearch({
        location: initialLocation,
        latitude: initialLatitude,
        longitude: initialLongitude,
        startDate: null,
        endDate: null
      });
    }
  }, []);

  const fetchGeocodingSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }

      console.log('Fetching geocoding suggestions for:', query);
      try {
        const url = `/api/geocode?q=${encodeURIComponent(query)}`;
        console.log('Geocoding URL:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch geocoding suggestions: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Geocoding results:', data);
        setSuggestions(data);
        setIsOpen(true);
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
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : 0
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions[highlightedIndex]) {
          handleSuggestionSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
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
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Enter city or ZIP code..."
              value={locationText}
              onChange={handleLocationChange}
              onFocus={() => locationText.length >= 3 && setIsOpen(true)}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-controls="suggestions-listbox"
              aria-activedescendant={isOpen && suggestions.length > 0 ? `suggestion-${highlightedIndex}` : undefined}
            />
            
            {isOpen && suggestions.length > 0 && (
              <div className="suggestions-dropdown" ref={suggestionsRef}>
                <ul 
                  className="suggestions" 
                  role="listbox" 
                  id="suggestions-listbox"
                >
                  {suggestions.map((suggestion, index) => (
                    <li
                      id={`suggestion-${index}`}
                      key={index}
                      className={`suggestion-item ${index === highlightedIndex ? 'highlighted' : ''}`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      role="option"
                      aria-selected={index === highlightedIndex}
                    >
                      <span role="img" aria-label="location">📍</span> {suggestion.locationLabel}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {isOpen && suggestions.length === 0 && locationText.length >= 3 && (
              <div className="suggestions-dropdown" ref={suggestionsRef}>
                <div className="suggestion-item-empty">
                  Searching for locations...
                </div>
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