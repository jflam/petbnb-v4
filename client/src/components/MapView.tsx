import React, { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, Source, Layer, LayerProps, ViewStateChangeEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Sitter } from '../types';

interface MapViewProps {
  sitters: Sitter[];
  latitude: number;
  longitude: number;
  onSitterSelect: (sitterId: number) => void;
  onMapMoved?: (lngLat: { lng: number; lat: number }) => void;
  filteredSitters?: Sitter[]; // Optional filtered sitters to show with different opacity
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MapView({
  sitters,
  latitude,
  longitude,
  onSitterSelect,
  onMapMoved,
  filteredSitters
}: MapViewProps) {
  const [selectedSitter, setSelectedSitter] = useState<Sitter | null>(null);
  const [autoUpdate, setAutoUpdate] = useState<boolean>(false);
  const [showCluster, setShowCluster] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [visibleSitters, setVisibleSitters] = useState<Sitter[]>([]);
  const mapRef = useRef<any>(null);

  // Helper to determine if we should enable clustering based on sitter count
  useEffect(() => {
    setShowCluster(sitters.length > 50);
    setShowHeatmap(sitters.length > 200);
  }, [sitters.length]);

  // For accessibility, keep track of visible sitters for screen readers
  useEffect(() => {
    if (mapRef.current && sitters.length > 0) {
      // Get current viewport bounds
      const bounds = mapRef.current.getMap().getBounds();
      
      // Filter sitters to those visible in the current viewport
      const visible = sitters.filter(sitter => 
        bounds.contains([sitter.longitude, sitter.latitude])
      );
      
      // Sort by distance and take top 3
      const topVisible = [...visible]
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      
      setVisibleSitters(topVisible);
    }
  }, [sitters, latitude, longitude]);

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

  const handleMove = useCallback(() => {
    if (mapRef.current && onMapMoved) {
      const center = mapRef.current.getMap().getCenter();
      
      // Emit analytics event
      const event = new CustomEvent('map_viewport_changed', {
        detail: { center, zoom: mapRef.current.getMap().getZoom() }
      });
      window.dispatchEvent(event);
      
      // Only trigger search if autoUpdate is enabled
      if (autoUpdate) {
        onMapMoved({ lng: center.lng, lat: center.lat });
      }
    }
  }, [onMapMoved, autoUpdate]);

  const handleSearchThisArea = () => {
    if (mapRef.current && onMapMoved) {
      const center = mapRef.current.getMap().getCenter();
      
      // Emit analytics event
      const event = new CustomEvent('search_this_area', {
        detail: { center }
      });
      window.dispatchEvent(event);
      
      onMapMoved({ lng: center.lng, lat: center.lat });
    }
  };

  const handleMarkerClick = (sitter: Sitter) => {
    setSelectedSitter(sitter);
    
    // Emit analytics event
    const event = new CustomEvent('map_pin_clicked', {
      detail: { sitterId: sitter.id, name: sitter.name }
    });
    window.dispatchEvent(event);
  };

  const handleViewStateChange = (evt: ViewStateChangeEvent) => {
    // Update visible sitters when the map viewport changes
    if (mapRef.current && sitters.length > 0) {
      const bounds = mapRef.current.getMap().getBounds();
      const visible = sitters.filter(sitter => 
        bounds.contains([sitter.longitude, sitter.latitude])
      );
      const topVisible = [...visible]
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      setVisibleSitters(topVisible);
    }
  };

  // Generate heatmap data if needed
  const getHeatmapData = () => {
    if (!showHeatmap) return null;
    
    return {
      type: 'FeatureCollection',
      features: sitters.map(sitter => ({
        type: 'Feature',
        properties: {
          intensity: Math.min(1, 5 / sitter.distance) // Higher intensity for closer sitters
        },
        geometry: {
          type: 'Point',
          coordinates: [sitter.longitude, sitter.latitude]
        }
      }))
    };
  };

  // Define heatmap layer style
  const heatmapLayer: LayerProps = {
    id: 'sitters-heat',
    type: 'heatmap',
    paint: {
      'heatmap-weight': ['get', 'intensity'],
      'heatmap-intensity': 1,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ],
      'heatmap-radius': 25,
      'heatmap-opacity': 0.5
    }
  };

  // A11y: Generate description of top visible sitters for screen readers
  const getA11yDescription = () => {
    if (visibleSitters.length === 0) return 'No sitters visible in current map view';
    
    return (
      <>
        <h3 className="sr-only">Top sitters in current view:</h3>
        <ul className="sr-only">
          {visibleSitters.map((sitter, i) => (
            <li key={sitter.id}>
              {i + 1}. {sitter.name}, {sitter.distance} miles away, ${sitter.rate}/night, 
              rating {sitter.rating.toFixed(1)}
            </li>
          ))}
        </ul>
      </>
    );
  };

  // Reset map when coordinates change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.getMap().flyTo({
        center: [longitude, latitude],
        zoom: calculateInitialZoom(),
        essential: true  // animation is considered essential for the user experience
      });
      
      // Log for debugging
      console.log('Map coordinates updated:', { latitude, longitude });
    }
  }, [latitude, longitude]);

  return (
    <div className="map-container">
      {/* A11y region that announces visible sitters */}
      <div className="map-a11y-region" aria-live="polite">
        {getA11yDescription()}
      </div>
      
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          latitude,
          longitude,
          zoom: calculateInitialZoom()
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onMoveEnd={handleMove}
        onMoveStart={handleViewStateChange}
        onZoomEnd={handleViewStateChange}
      >
        <NavigationControl position="top-right" />
        
        {/* Heatmap layer when enabled */}
        {showHeatmap && (
          <Source type="geojson" data={getHeatmapData() as any}>
            <Layer {...heatmapLayer} />
          </Source>
        )}
        
        {/* Current location marker */}
        <Marker
          latitude={latitude}
          longitude={longitude}
          anchor="bottom"
        >
          <div className="current-location-marker">
            <span role="img" aria-label="Current location">📍</span>
          </div>
        </Marker>
        
        {/* Sitter markers */}
        {sitters.map((sitter, index) => {
          // Check if this sitter is filtered out (for faded appearance)
          const isFiltered = filteredSitters && !filteredSitters.some(s => s.id === sitter.id);
          
          return (
            <Marker
              key={sitter.id}
              latitude={sitter.latitude}
              longitude={sitter.longitude}
              anchor="bottom"
              onClick={() => handleMarkerClick(sitter)}
            >
              <div 
                className={`sitter-marker ${selectedSitter?.id === sitter.id ? 'selected' : ''} ${isFiltered ? 'filtered' : ''}`}
                aria-label={`Sitter ${index + 1}: ${sitter.name}, ${sitter.distance} miles away`}
              >
                {index + 1}
              </div>
            </Marker>
          );
        })}
        
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

        {/* Map controls */}
        <div className="map-controls">
          <div className="search-area-button-container">
            <button 
              className="search-area-button"
              onClick={handleSearchThisArea}
              aria-label="Search this map area"
            >
              Search this area
            </button>
            
            <div className="auto-update-control">
              <input 
                type="checkbox" 
                id="auto-update-map" 
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
              />
              <label htmlFor="auto-update-map">Auto-update</label>
            </div>
          </div>
        </div>
      </Map>
    </div>
  );
}