import React from 'react';
import { Sitter } from '../types';

interface SitterCardProps {
  sitter: Sitter;
  onSelect: (sitterId: number) => void;
}

export default function SitterCard({ sitter, onSelect }: SitterCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    return `Updated ${diffDays} days ago`;
  };

  const getServiceIcons = (services: string[]) => {
    const icons = {
      boarding: '🏠',
      house_sitting: '🔑',
      drop_in: '🚪',
      day_care: '☀️',
      walking: '🦮'
    };
    
    return services.map(service => {
      const icon = icons[service as keyof typeof icons] || '❓';
      return (
        <span key={service} className="service-icon" title={service.replace('_', ' ')}>
          {icon}
        </span>
      );
    });
  };

  const getPetTypeIcons = (petTypes: string[]) => {
    const icons = {
      dogs: '🐕',
      cats: '🐱',
      birds: '🦜',
      rodents: '🐹'
    };
    
    return petTypes.map(petType => {
      const icon = icons[petType as keyof typeof icons] || '❓';
      return (
        <span key={petType} className="pet-type-icon">
          {icon}
        </span>
      );
    });
  };

  return (
    <div className="sitter-card" onClick={() => onSelect(sitter.id)}>
      <div className="sitter-photo-container">
        <img src={sitter.photo_url} alt={sitter.name} className="sitter-photo" />
        {sitter.top_sitter && <div className="top-sitter-badge">⭐ Top Sitter</div>}
      </div>
      
      <div className="sitter-info">
        <div className="sitter-header">
          <h3 className="sitter-name">{sitter.name}</h3>
          <div className="sitter-distance">{sitter.distance} mi</div>
        </div>
        
        <div className="sitter-rating">
          ⭐ {sitter.rating.toFixed(1)} ({sitter.review_count} reviews)
        </div>
        
        <div className="sitter-price">${sitter.rate}/night</div>
        
        <div className="sitter-pet-types">{getPetTypeIcons(sitter.pet_types)}</div>
        
        <div className="sitter-services">{getServiceIcons(sitter.services)}</div>
        
        <div className="sitter-badges">
          {sitter.verified && <span className="verified-badge">✓ Verified</span>}
          {sitter.repeat_client_count > 0 && (
            <span className="repeat-clients-badge">
              🔄 {sitter.repeat_client_count} repeat {sitter.repeat_client_count === 1 ? 'client' : 'clients'}
            </span>
          )}
        </div>
        
        <div className="availability-updated">
          {formatDate(sitter.availability_updated_at)}
        </div>
      </div>
    </div>
  );
}