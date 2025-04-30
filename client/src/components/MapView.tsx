import React, { useState, useEffect, useCallback, useRef } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Sitter } from '../types';

interface MapViewProps {
  sitters: Sitter[];
  latitude: number;
  longitude: number;
  onSitterSelect: (sitterId: number) => void;
  onMapMoved?: (lngLat: { lng: number; lat: number }) => void;
}

// Use a placeholder token for development
// In production, we would use an env variable from the backend
const MAPBOX_TOKEN = 'pk.placeholder_token'; 

export default function MapView({
  sitters,
  latitude,
  longitude,
  onSitterSelect,
  onMapMoved
}: MapViewProps) {
  const [selectedSitter, setSelectedSitter] = useState<Sitter | null>(null);
  const [viewport, setViewport] = useState({
    latitude,
    longitude,
    zoom: 11
  });

  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Center map on the provided coordinates whenever they change
    setViewport(prev => ({
      ...prev,
      latitude,
      longitude
    }));
  }, [latitude, longitude]);

  const handleMapMoved = useCallback(() => {
    if (mapRef.current && onMapMoved) {
      const center = mapRef.current.getMap().getCenter();
      onMapMoved({ lng: center.lng, lat: center.lat });
    }
  }, [onMapMoved]);

  const handleMarkerClick = (sitter: Sitter) => {
    setSelectedSitter(sitter);
  };

  const calculateInitialZoom = () => {
    if (sitters.length === 0) return 11;
    
    // Find the maximum distance of any sitter
    const maxDistance = Math.max(...sitters.map(s => s.distance));
    
    // Adjust zoom based on maximum distance
    if (maxDistance <= 2) return 13;
    if (maxDistance <= 5) return 12;
    if (maxDistance <= 10) return 11;
    if (maxDistance <= 20) return 10;
    return 9;
  };

  return (
    <div className="map-container">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        {...viewport}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onMoveEnd={handleMapMoved}
        initialViewState={{
          latitude,
          longitude,
          zoom: calculateInitialZoom()
        }}
      >
        <NavigationControl position="top-right" />
        
        {/* Current location marker */}
        <Marker
          latitude={latitude}
          longitude={longitude}
          anchor="bottom"
        >
          <div className="current-location-marker">
            <span>📍</span>
          </div>
        </Marker>
        
        {/* Sitter markers */}
        {sitters.map((sitter, index) => (
          <Marker
            key={sitter.id}
            latitude={sitter.latitude}
            longitude={sitter.longitude}
            anchor="bottom"
            onClick={() => handleMarkerClick(sitter)}
          >
            <div className={`sitter-marker ${selectedSitter?.id === sitter.id ? 'selected' : ''}`}>
              {index + 1}
            </div>
          </Marker>
        ))}
        
        {/* Selected sitter popup */}
        {selectedSitter && (
          <Popup
            latitude={selectedSitter.latitude}
            longitude={selectedSitter.longitude}
            closeOnClick={false}
            anchor="top"
            onClose={() => setSelectedSitter(null)}
            offset={15}
          >
            <div className="sitter-popup" onClick={() => onSitterSelect(selectedSitter.id)}>
              <img 
                src={selectedSitter.photo_url} 
                alt={selectedSitter.name} 
                className="popup-image" 
              />
              <div className="popup-content">
                <h3>{selectedSitter.name}</h3>
                <div>⭐ {selectedSitter.rating} ({selectedSitter.review_count})</div>
                <div>${selectedSitter.rate}/night</div>
                <div>{selectedSitter.distance} miles away</div>
              </div>
            </div>
          </Popup>
        )}

        {/* Search this area button */}
        <div className="search-area-button-container">
          <button 
            className="search-area-button"
            onClick={handleMapMoved}
          >
            Search this area
          </button>
        </div>
      </Map>
    </div>
  );
}