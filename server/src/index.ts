import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import db from './db';
import { geocode, addPrivacyOffset, Coords } from './services/geocoder';
import rankingConfig from './config/ranking.json';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Type definitions
interface Sitter {
  id: number;
  name: string;
  photo_url: string;
  rate: number;
  rating: number;
  review_count: number;
  repeat_client_count: number;
  location: string;
  latitude: number;
  longitude: number;
  verified: boolean;
  top_sitter: boolean;
  availability_updated_at: string;
  services: string;
  pet_types: string;
  dog_sizes: string | null;
  certifications: string | null;
  special_needs: string | null;
  home_features: string | null;
  median_response_time: number | null;
  distance?: number;
}

// Utility function to calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(1));
}

// Legacy endpoint for fortunes
app.get('/api/fortunes/random', async (_req, res) => {
  try {
    const fortune = await db<{ id: number; text: string }>('fortunes')
      .orderByRaw('RANDOM()')
      .first();
    if (!fortune) return res.status(404).json({ error: 'No fortunes found.' });
    res.json(fortune);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Sitter search endpoint
app.get('/api/v1/sitters/search', async (req, res) => {
  try {
    // Default location (Seattle, WA - Pike Place Market)
    const defaultLat = 47.6097;
    const defaultLon = -122.3422;

    // Extract query parameters
    let {
      location,
      latitude = defaultLat,
      longitude = defaultLon,
      minPrice,
      maxPrice,
      minRating,
      service,
      petType,
      dogSize,
      distance: maxDistance,
      topSittersOnly,
      startDate,
      endDate,
      sort = 'distance',
      address
    } = req.query;
    
    // Enhanced logging with parameter types to debug distance filter issue
    console.log('Received request with parameters:', { 
      location,
      latitude, 
      longitude,
      maxDistance,
      maxDistanceType: maxDistance !== undefined ? typeof maxDistance : 'undefined',
      maxDistanceValue: maxDistance !== undefined ? maxDistance : 'undefined',
      topSittersOnly,
      sort
    });
    
    // 1. Location handling:
    // a. If address is provided, treat it as authoritative source
    // b. Otherwise use location + lat/lng
    if (address) {
      location = address;
    }
    
    // If only location is provided (no lat/lng), geocode it
    if (location && (!latitude || latitude === defaultLat) && (!longitude || longitude === defaultLon)) {
      try {
        const results = await geocode(location as string);
        if (results && results.length > 0) {
          latitude = results[0].latitude;
          longitude = results[0].longitude;
        }
      } catch (error) {
        console.error('Error geocoding location:', error);
        // Fall back to default coordinates if geocoding fails
      }
    }

    // Base query
    let query = db<Sitter>('sitters');

    // Apply filters
    if (minPrice) {
      query = query.where('rate', '>=', Number(minPrice));
    }

    if (maxPrice) {
      query = query.where('rate', '<=', Number(maxPrice));
    }

    if (minRating) {
      query = query.where('rating', '>=', Number(minRating));
    }

    if (service) {
      query = query.whereRaw('JSON_EXTRACT(services, "$") LIKE ?', [`%${service}%`]);
    }

    if (petType) {
      query = query.whereRaw('JSON_EXTRACT(pet_types, "$") LIKE ?', [`%${petType}%`]);
    }

    // Handle multiple dog sizes (array) or single dog size
    if (dogSize) {
      if (Array.isArray(dogSize)) {
        const sizeConditions = dogSize.map(size => `JSON_EXTRACT(dog_sizes, "$") LIKE '%${size}%'`);
        query = query.whereRaw(`(${sizeConditions.join(' OR ')})`);
      } else {
        query = query.whereRaw('JSON_EXTRACT(dog_sizes, "$") LIKE ?', [`%${dogSize}%`]);
      }
    }

    // Filter by special needs if provided
    const specialNeeds = req.query.specialNeeds;
    if (specialNeeds) {
      if (Array.isArray(specialNeeds)) {
        const needsConditions = specialNeeds.map(need => `JSON_EXTRACT(special_needs, "$") LIKE '%${need}%'`);
        query = query.whereRaw(`(${needsConditions.join(' OR ')})`);
      } else {
        query = query.whereRaw('JSON_EXTRACT(special_needs, "$") LIKE ?', [`%${specialNeeds}%`]);
      }
    }

    // Filter by home features if provided
    const homeFeatures = req.query.homeFeatures;
    if (homeFeatures) {
      if (Array.isArray(homeFeatures)) {
        const featureConditions = homeFeatures.map(feature => `JSON_EXTRACT(home_features, "$") LIKE '%${feature}%'`);
        query = query.whereRaw(`(${featureConditions.join(' OR ')})`);
      } else {
        query = query.whereRaw('JSON_EXTRACT(home_features, "$") LIKE ?', [`%${homeFeatures}%`]);
      }
    }

    // Filter by top sitters only
    if (topSittersOnly === 'true') {
      query = query.where('top_sitter', true);
    }

    // Get results
    const sitters = await query;

    // 2. Geocode sitters with null coordinates and update them in the database
    const sitterUpdatePromises: Promise<any>[] = [];
    
    for (const sitter of sitters) {
      if (sitter.latitude === null || sitter.longitude === null) {
        try {
          // Geocode the sitter's address
          const results = await geocode(sitter.address);
          if (results && results.length > 0) {
            // Update the sitter's coordinates in memory
            sitter.latitude = results[0].latitude;
            sitter.longitude = results[0].longitude;
            
            // Queue a database update for the coordinates
            sitterUpdatePromises.push(
              db('sitters')
                .where('id', sitter.id)
                .update({
                  latitude: results[0].latitude,
                  longitude: results[0].longitude
                })
            );
          }
        } catch (error) {
          console.error(`Error geocoding sitter address for ${sitter.name}:`, error);
        }
      }
    }
    
    // Execute all database updates in parallel
    if (sitterUpdatePromises.length > 0) {
      await Promise.allSettled(sitterUpdatePromises);
    }

    // 3. Calculate distance using Haversine and normalize signals for ranking
    const sittersWithMetrics = sitters.map(sitter => {
      // Calculate distance
      const distance = calculateDistance(
        Number(latitude),
        Number(longitude),
        sitter.latitude,
        sitter.longitude
      );
      
      // Calculate days since availability update
      const availabilityDate = new Date(sitter.availability_updated_at);
      const now = new Date();
      const daysSinceUpdate = Math.floor((now.getTime() - availabilityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate repeat client percentage
      const totalClients = sitter.review_count;
      const repeatPercentage = totalClients > 0 ? sitter.repeat_client_count / totalClients : 0;
      
      // For median response time, lower is better
      const responseScore = sitter.median_response_time 
        ? Math.max(0, 1 - (sitter.median_response_time / 24)) // Normalize: 0h = 1, 24h+ = 0
        : 0.5; // Default score if missing
      
      return {
        ...sitter,
        distance,
        metrics: {
          distanceScore: 0, // Will be calculated after normalization
          ratingScore: sitter.rating / 5, // Normalize rating to 0-1
          availabilityScore: Math.max(0, 1 - (daysSinceUpdate / 10)), // Newer = better, over 10 days old = 0
          responseScore,
          repeatClientScore: repeatPercentage
        }
      };
    });

    // 4. Filter by maximum distance if provided
    // Fix for maxDistance filter - ensure it's properly converted to number
    let maxDistanceNum = null;
    if (maxDistance !== undefined && maxDistance !== null) {
      maxDistanceNum = Number(maxDistance);
      console.log('Filtering by max distance:', maxDistanceNum);
    }
    
    const filteredSitters = maxDistanceNum && !isNaN(maxDistanceNum)
      ? sittersWithMetrics.filter(sitter => sitter.distance <= maxDistanceNum)
      : sittersWithMetrics;
    
    if (filteredSitters.length === 0) {
      return res.json({
        count: 0,
        sitters: [],
        query: {
          location: location || 'Seattle, WA',
          latitude,
          longitude,
          startDate: startDate || null,
          endDate: endDate || null,
          sort
        }
      });
    }

    // 5. Normalize distance score (lowest distance gets highest score)
    const maxDist = Math.max(...filteredSitters.map(s => s.distance));
    filteredSitters.forEach(sitter => {
      sitter.metrics.distanceScore = maxDist > 0 ? 1 - (sitter.distance / maxDist) : 1;
    });

    // 6. Calculate weighted score based on ranking config
    filteredSitters.forEach(sitter => {
      sitter.rankScore = (
        rankingConfig.distance * sitter.metrics.distanceScore +
        rankingConfig.rating * sitter.metrics.ratingScore +
        rankingConfig.availability * sitter.metrics.availabilityScore +
        rankingConfig.responseRate * sitter.metrics.responseScore +
        rankingConfig.repeatClient * sitter.metrics.repeatClientScore
      );
    });

    // 7. Sort results based on the sort parameter
    const sortedSitters = [...filteredSitters]; // Create a copy for sorting
    
    sortedSitters.sort((a, b) => {
      switch (sort) {
        case 'price':
          // First by price (lowest first)
          if (a.rate !== b.rate) {
            return a.rate - b.rate;
          }
          // Then by rank score
          return b.rankScore - a.rankScore;
          
        case 'rating':
          // First by rating (highest first)
          if (a.rating !== b.rating) {
            return b.rating - a.rating;
          }
          // Then by repeat clients (highest first)
          if (a.repeat_client_count !== b.repeat_client_count) {
            return b.repeat_client_count - a.repeat_client_count;
          }
          // Then by rank score
          return b.rankScore - a.rankScore;
        
        case 'ranked':
        default:
          // By calculated rank score
          return b.rankScore - a.rankScore;
      }
    });

    // 8. Process data for response (parse JSON strings)
    const processedSitters = sortedSitters.map(sitter => ({
      ...sitter,
      services: JSON.parse(sitter.services),
      pet_types: JSON.parse(sitter.pet_types),
      dog_sizes: sitter.dog_sizes ? JSON.parse(sitter.dog_sizes) : null,
      certifications: sitter.certifications ? JSON.parse(sitter.certifications) : null,
      special_needs: sitter.special_needs ? JSON.parse(sitter.special_needs) : null,
      home_features: sitter.home_features ? JSON.parse(sitter.home_features) : null
    }));

    res.json({
      count: processedSitters.length,
      sitters: processedSitters,
      query: {
        location: location || 'Seattle, WA',
        latitude,
        longitude,
        startDate: startDate || null,
        endDate: endDate || null,
        sort
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Geocoding endpoint
app.get('/api/geocode', async (req, res) => {
  try {
    const query = req.query.q as string;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const results = await geocode(query);
    
    // Apply privacy offset to the coordinates
    const resultsWithOffset = results.map(result => addPrivacyOffset(result));
    
    res.json(resultsWithOffset);
  } catch (err) {
    console.error('Geocoding error:', err);
    res.status(500).json({ error: 'Geocoding service error' });
  }
});

app.listen(PORT, () => {
  console.log(`🐾 PetBnB API listening at http://localhost:${PORT}`);
});