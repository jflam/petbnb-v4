import React from 'react';
import { Sitter } from '../types';

interface SitterCardProps {
  sitter: Sitter;
  onSelect: (sitterId: number) => void;
  index?: number; // For numbering on the map
}

export default function SitterCard({ sitter, onSelect, index }: SitterCardProps) {
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

  // Calculate repeat client percentage
  const calculateRepeatClientPercentage = () => {
    if (sitter.review_count === 0) return 0;
    return Math.round((sitter.repeat_client_count / sitter.review_count) * 100);
  };

  // Format services with pricing
  const formatServicePricing = () => {
    if (sitter.services.length <= 1) {
      return (
        <div className="sitter-price">${sitter.rate}/night</div>
      );
    }
    
    // For multiple services, show first two with pricing
    const serviceLabels: Record<string, string> = {
      'boarding': 'Boarding',
      'house_sitting': 'House Sitting',
      'drop_in': 'Drop-In',
      'day_care': 'Day Care',
      'walking': 'Walking'
    };
    
    const displayServices = sitter.services.slice(0, 2);
    return (
      <div className="sitter-multi-price">
        {displayServices.map((service, i) => (
          <div key={service} className="service-price">
            {serviceLabels[service] || service} from ${Math.round(sitter.rate * (i === 0 ? 1 : 0.8))}
            {i === 0 && displayServices.length > 1 ? ' · ' : ''}
          </div>
        ))}
        {sitter.services.length > 2 && 
          <div className="more-services">+{sitter.services.length - 2} more</div>
        }
      </div>
    );
  };

  return (
    <div className="sitter-card" onClick={() => onSelect(sitter.id)}>
      <div className="sitter-photo-container">
        <img src={sitter.photo_url} alt={sitter.name} className="sitter-photo" />
        {sitter.top_sitter && <div className="top-sitter-badge">⭐ Top Sitter</div>}
        {index !== undefined && <div className="sitter-index-badge">{index + 1}</div>}
      </div>
      
      <div className="sitter-info">
        <div className="sitter-header">
          <h3 className="sitter-name">{sitter.name}</h3>
          <div className="sitter-distance">{sitter.distance} mi</div>
        </div>
        
        <div className="sitter-rating">
          <div className="rating-tooltip">
            <span className="rating-stars">⭐ {sitter.rating.toFixed(1)}</span>
            <span className="rating-tooltip-text">
              {sitter.review_count} reviews
              {sitter.repeat_client_count > 0 && ` · ${calculateRepeatClientPercentage()}% repeat clients`}
            </span>
          </div>
        </div>
        
        {formatServicePricing()}
        
        <div className="sitter-pet-types">{getPetTypeIcons(sitter.pet_types)}</div>
        
        <div className="sitter-services">{getServiceIcons(sitter.services)}</div>
        
        <div className="sitter-badges">
          {sitter.verified && <span className="verified-badge">✓ Verified</span>}
          {sitter.repeat_client_count > 0 && (
            <span className="repeat-clients-badge" title={`${calculateRepeatClientPercentage()}% repeat booking rate`}>
              🔄 {calculateRepeatClientPercentage()}% repeat clients
            </span>
          )}
          {sitter.median_response_time !== null && (
            <span className="response-time-badge" title="Median response time">
              ⏱️ Responds in {sitter.median_response_time === 1 ? 'about an hour' : `~${sitter.median_response_time} hours`}
            </span>
          )}
        </div>
        
        <div className="availability-updated">
          {formatDate(sitter.availability_updated_at)}
        </div>
        
        {sitter.special_needs && sitter.special_needs.length > 0 && (
          <div className="special-needs">
            <span className="badge">Special needs:</span>
            {sitter.special_needs.map(need => (
              <span key={need} className="special-need-tag">
                {need}
              </span>
            ))}
          </div>
        )}
        
        {sitter.home_features && sitter.home_features.length > 0 && (
          <div className="home-features">
            <span className="badge">Home features:</span>
            {sitter.home_features.map(feature => (
              <span key={feature} className="home-feature-tag">
                {feature.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}