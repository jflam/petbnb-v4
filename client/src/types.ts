export interface Sitter {
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
  address: string; // NEW
  verified: boolean;
  top_sitter: boolean;
  availability_updated_at: string;
  services: string[];
  pet_types: string[];
  dog_sizes: string[] | null;
  certifications: string[] | null;
  special_needs: string[] | null;
  home_features: string[] | null;
  median_response_time: number | null;
  distance: number;
}

export interface SearchQuery {
  location?: string;
  latitude?: number;
  longitude?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  service?: string;
  petType?: string;
  dogSize?: string[] | string; // Updated to support multiple sizes
  distance?: number;
  topSittersOnly?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  sort?: 'distance' | 'price' | 'rating';
  specialNeeds?: string[];
  homeFeatures?: string[];
  view?: 'list' | 'map';
}

export interface SearchResponse {
  count: number;
  sitters: Sitter[];
  query: {
    location: string;
    latitude: number;
    longitude: number;
    startDate: string | null;
    endDate: string | null;
    sort: string;
  };
}

export interface FilterState {
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  service: string | null;
  petType: string | null;
  dogSize: string[] | null; // Updated to support multiple sizes
  distance: number | null;
  topSittersOnly: boolean;
  specialNeeds: string[] | null;
  homeFeatures: string[] | null;
  sort: 'distance' | 'price' | 'rating';
  view: 'list' | 'map';
}

export const ServiceOptions = [
  { value: 'boarding', label: 'Boarding' },
  { value: 'house_sitting', label: 'House Sitting' },
  { value: 'drop_in', label: 'Drop-In Visits' },
  { value: 'day_care', label: 'Day Care' },
  { value: 'walking', label: 'Dog Walking' }
];

export const PetTypeOptions = [
  { value: 'dogs', label: 'Dogs' },
  { value: 'cats', label: 'Cats' },
  { value: 'birds', label: 'Birds' },
  { value: 'rodents', label: 'Small Pets' }
];

export const DogSizeOptions = [
  { value: 'xs', label: 'Extra Small (0-15 lbs)' },
  { value: 'small', label: 'Small (16-25 lbs)' },
  { value: 'medium', label: 'Medium (26-40 lbs)' },
  { value: 'large', label: 'Large (41-100 lbs)' },
  { value: 'xl', label: 'Extra Large (100+ lbs)' }
];

export const SpecialNeedsOptions = [
  { value: 'puppy', label: 'Puppy' },
  { value: 'senior', label: 'Senior' },
  { value: 'medication', label: 'Medication Required' },
  { value: 'reactive', label: 'Reactive' }
];

export const HomeFeaturesOptions = [
  { value: 'fenced_yard', label: 'Fenced Yard' },
  { value: 'smoke_free', label: 'Smoke-Free' },
  { value: 'no_other_pets', label: 'No Other Pets' }
];

export const SortOptions = [
  { value: 'distance', label: 'Distance (nearest first)' },
  { value: 'price', label: 'Price (lowest first)' },
  { value: 'rating', label: 'Rating (highest first)' }
];

export const ViewOptions = [
  { value: 'list', label: 'List View' },
  { value: 'map', label: 'Map View' }
];