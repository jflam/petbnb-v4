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
  verified: boolean;
  top_sitter: boolean;
  availability_updated_at: string;
  services: string[];
  pet_types: string[];
  dog_sizes: string[] | null;
  certifications: string[] | null;
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
  dogSize?: string;
  distance?: number;
  topSittersOnly?: boolean;
}

export interface SearchResponse {
  count: number;
  sitters: Sitter[];
  query: {
    location: string;
    latitude: number;
    longitude: number;
  };
}

export interface FilterState {
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  service: string | null;
  petType: string | null;
  dogSize: string | null;
  distance: number | null;
  topSittersOnly: boolean;
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
  { value: 'small', label: 'Small (0-15 lbs)' },
  { value: 'medium', label: 'Medium (16-40 lbs)' },
  { value: 'large', label: 'Large (41-100 lbs)' },
  { value: 'giant', label: 'Giant (100+ lbs)' }
];