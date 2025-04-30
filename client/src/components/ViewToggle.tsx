import React from 'react';

type ViewType = 'list' | 'map';

interface ViewToggleProps {
  currentView: ViewType;
  onToggle: (view: ViewType) => void;
}

export default function ViewToggle({ currentView, onToggle }: ViewToggleProps) {
  return (
    <div className="view-toggle">
      <button 
        className={`toggle-button ${currentView === 'list' ? 'active' : ''}`}
        onClick={() => onToggle('list')}
        aria-label="Show list view"
      >
        <span className="toggle-icon">📋</span> List
      </button>
      <button 
        className={`toggle-button ${currentView === 'map' ? 'active' : ''}`}
        onClick={() => onToggle('map')}
        aria-label="Show map view"
      >
        <span className="toggle-icon">🗺️</span> Map
      </button>
    </div>
  );
}