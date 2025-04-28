/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('sitters').del();
  
  // Generate random dates within the last 10 days
  const getRecentDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 10));
    return date;
  };
  
  await knex('sitters').insert([
    {
      name: 'Sarah Johnson',
      photo_url: 'https://randomuser.me/api/portraits/women/1.jpg',
      rate: 45.00,
      rating: 4.8,
      review_count: 127,
      repeat_client_count: 36,
      location: 'Seattle, WA',
      latitude: 47.6062,
      longitude: -122.3321,
      verified: true,
      top_sitter: true,
      availability_updated_at: getRecentDate(),
      services: JSON.stringify(['boarding', 'house_sitting', 'drop_in']),
      pet_types: JSON.stringify(['dogs', 'cats']),
      dog_sizes: JSON.stringify(['small', 'medium', 'large']),
      certifications: JSON.stringify(['background_check', 'first_aid'])
    },
    {
      name: 'Michael Chen',
      photo_url: 'https://randomuser.me/api/portraits/men/2.jpg',
      rate: 55.00,
      rating: 4.9,
      review_count: 89,
      repeat_client_count: 24,
      location: 'Seattle, WA',
      latitude: 47.6092,
      longitude: -122.3150,
      verified: true,
      top_sitter: true,
      availability_updated_at: getRecentDate(),
      services: JSON.stringify(['boarding', 'day_care', 'walking']),
      pet_types: JSON.stringify(['dogs']),
      dog_sizes: JSON.stringify(['medium', 'large']),
      certifications: JSON.stringify(['background_check', 'dog_training'])
    },
    {
      name: 'Emily Rodriguez',
      photo_url: 'https://randomuser.me/api/portraits/women/3.jpg',
      rate: 40.00,
      rating: 4.7,
      review_count: 56,
      repeat_client_count: 15,
      location: 'Bellevue, WA',
      latitude: 47.6101,
      longitude: -122.2015,
      verified: true,
      top_sitter: false,
      availability_updated_at: getRecentDate(),
      services: JSON.stringify(['house_sitting', 'drop_in']),
      pet_types: JSON.stringify(['cats', 'birds']),
      dog_sizes: null,
      certifications: JSON.stringify(['background_check'])
    },
    {
      name: 'David Wilson',
      photo_url: 'https://randomuser.me/api/portraits/men/4.jpg',
      rate: 60.00,
      rating: 5.0,
      review_count: 32,
      repeat_client_count: 10,
      location: 'Redmond, WA',
      latitude: 47.6740,
      longitude: -122.1215,
      verified: true,
      top_sitter: false,
      availability_updated_at: getRecentDate(),
      services: JSON.stringify(['boarding', 'day_care']),
      pet_types: JSON.stringify(['dogs', 'cats']),
      dog_sizes: JSON.stringify(['small', 'medium']),
      certifications: JSON.stringify(['background_check', 'first_aid', 'dog_training'])
    },
    {
      name: 'Jessica Martinez',
      photo_url: 'https://randomuser.me/api/portraits/women/5.jpg',
      rate: 35.00,
      rating: 4.6,
      review_count: 19,
      repeat_client_count: 5,
      location: 'Renton, WA',
      latitude: 47.4829,
      longitude: -122.2171,
      verified: true,
      top_sitter: false,
      availability_updated_at: getRecentDate(),
      services: JSON.stringify(['drop_in', 'walking']),
      pet_types: JSON.stringify(['dogs', 'cats', 'rodents']),
      dog_sizes: JSON.stringify(['small', 'medium']),
      certifications: JSON.stringify(['background_check'])
    },
    {
      name: 'Daniel Thompson',
      photo_url: 'https://randomuser.me/api/portraits/men/6.jpg',
      rate: 50.00,
      rating: 4.5,
      review_count: 42,
      repeat_client_count: 12,
      location: 'Tacoma, WA',
      latitude: 47.2529,
      longitude: -122.4443,
      verified: true,
      top_sitter: false,
      availability_updated_at: getRecentDate(),
      services: JSON.stringify(['boarding', 'house_sitting']),
      pet_types: JSON.stringify(['dogs']),
      dog_sizes: JSON.stringify(['large', 'giant']),
      certifications: JSON.stringify(['background_check', 'first_aid'])
    },
    {
      name: 'Sophia Lee',
      photo_url: 'https://randomuser.me/api/portraits/women/7.jpg',
      rate: 65.00,
      rating: 4.9,
      review_count: 76,
      repeat_client_count: 22,
      location: 'Kirkland, WA',
      latitude: 47.6769,
      longitude: -122.2060,
      verified: true,
      top_sitter: true,
      availability_updated_at: getRecentDate(),
      services: JSON.stringify(['boarding', 'house_sitting', 'day_care']),
      pet_types: JSON.stringify(['dogs', 'cats']),
      dog_sizes: JSON.stringify(['small', 'medium', 'large']),
      certifications: JSON.stringify(['background_check', 'first_aid', 'dog_training'])
    },
    {
      name: 'James Anderson',
      photo_url: 'https://randomuser.me/api/portraits/men/8.jpg',
      rate: 45.00,
      rating: 4.7,
      review_count: 31,
      repeat_client_count: 8,
      location: 'Issaquah, WA',
      latitude: 47.5301,
      longitude: -122.0326,
      verified: false,
      top_sitter: false,
      availability_updated_at: getRecentDate(),
      services: JSON.stringify(['drop_in', 'walking']),
      pet_types: JSON.stringify(['dogs']),
      dog_sizes: JSON.stringify(['small', 'medium']),
      certifications: null
    },
    {
      name: 'Olivia Garcia',
      photo_url: 'https://randomuser.me/api/portraits/women/9.jpg',
      rate: 55.00,
      rating: 4.8,
      review_count: 23,
      repeat_client_count: 7,
      location: 'Woodinville, WA',
      latitude: 47.7543,
      longitude: -122.1635,
      verified: true,
      top_sitter: false,
      availability_updated_at: getRecentDate(),
      services: JSON.stringify(['boarding', 'day_care']),
      pet_types: JSON.stringify(['dogs', 'cats', 'birds']),
      dog_sizes: JSON.stringify(['small', 'medium']),
      certifications: JSON.stringify(['background_check'])
    },
    {
      name: 'Ethan Nguyen',
      photo_url: 'https://randomuser.me/api/portraits/men/10.jpg',
      rate: 40.00,
      rating: 4.6,
      review_count: 14,
      repeat_client_count: 3,
      location: 'Mercer Island, WA',
      latitude: 47.5707,
      longitude: -122.2221,
      verified: true,
      top_sitter: false,
      availability_updated_at: getRecentDate(),
      services: JSON.stringify(['house_sitting', 'drop_in']),
      pet_types: JSON.stringify(['cats']),
      dog_sizes: null,
      certifications: JSON.stringify(['background_check'])
    }
  ]);
};