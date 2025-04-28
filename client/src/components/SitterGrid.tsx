import React from 'react';
import SitterCard from './SitterCard';
import { Sitter } from '../types';

interface SitterGridProps {
  sitters: Sitter[];
  isLoading: boolean;
  error: string | null;
  onSitterSelect: (sitterId: number) => void;
}

export default function SitterGrid({ 
  sitters, 
  isLoading, 
  error, 
  onSitterSelect 
}: SitterGridProps) {
  if (isLoading) {
    return (
      <div className="sitter-grid-loading" data-cy="loading-state">
        <div className="loading-spinner"></div>
        <p>Finding the perfect sitters for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sitter-grid-error" data-cy="error-state">
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <p>Please try again later or adjust your search criteria.</p>
      </div>
    );
  }

  if (sitters.length === 0) {
    return (
      <div className="sitter-grid-empty" data-cy="empty-state">
        <div className="empty-state-illustration">🔍</div>
        <h3>No sitters match your filters</h3>
        <p>Try adjusting your filters or search criteria to see more results.</p>
      </div>
    );
  }

  return (
    <div className="sitter-grid">
      {sitters.map(sitter => (
        <SitterCard 
          key={sitter.id} 
          sitter={sitter} 
          onSelect={onSitterSelect} 
        />
      ))}
    </div>
  );
}