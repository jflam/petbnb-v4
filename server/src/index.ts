import express from 'express';
import cors from 'cors';
import db from './db';

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
    // Default location (Seattle)
    const defaultLat = 47.6062;
    const defaultLon = -122.3321;

    // Extract query parameters
    const {
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
      topSittersOnly
    } = req.query;

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

    if (dogSize) {
      query = query.whereRaw('JSON_EXTRACT(dog_sizes, "$") LIKE ?', [`%${dogSize}%`]);
    }

    if (topSittersOnly === 'true') {
      query = query.where('top_sitter', true);
    }

    // Get results
    const sitters = await query;

    // Calculate distance and filter by maxDistance if provided
    const sittersWithDistance = sitters.map(sitter => {
      const distance = calculateDistance(
        Number(latitude),
        Number(longitude),
        sitter.latitude,
        sitter.longitude
      );
      return { ...sitter, distance };
    });

    // Filter by distance if maxDistance is provided
    const filteredSitters = maxDistance
      ? sittersWithDistance.filter(sitter => sitter.distance <= Number(maxDistance))
      : sittersWithDistance;

    // Sort by distance
    const sortedSitters = filteredSitters.sort((a, b) => {
      // First by distance
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      // Then by rating (highest first)
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
      // Then by repeat clients (highest first)
      return b.repeat_client_count - a.repeat_client_count;
    });

    // Process data for response (parse JSON strings)
    const processedSitters = sortedSitters.map(sitter => ({
      ...sitter,
      services: JSON.parse(sitter.services),
      pet_types: JSON.parse(sitter.pet_types),
      dog_sizes: sitter.dog_sizes ? JSON.parse(sitter.dog_sizes) : null,
      certifications: sitter.certifications ? JSON.parse(sitter.certifications) : null
    }));

    res.json({
      count: processedSitters.length,
      sitters: processedSitters,
      query: {
        location: location || 'Seattle, WA',
        latitude,
        longitude
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`🐾 PetBnB API listening at http://localhost:${PORT}`);
});