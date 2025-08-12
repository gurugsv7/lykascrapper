import { AreaInfo } from '../types/Property';

export const AREAS: AreaInfo[] = [
  // Villas/Townhouses
  {
    name: 'Al Barari',
    fileName: 'albarari_total.json',
    category: 'villas',
    
  },
  {
    name: 'Damac Lagoons',
    fileName: 'damac_lagoons_total.json',
    category: 'villas',
  
  },
  {
    name: 'Damac Hills',
    fileName: 'damac_hills_total.json',
    category: 'villas',
    
  },
  {
    name: 'Palm Jumeirah',
    fileName: 'Palm_Jumeirah_total.json',
    category: 'townhouses',
    
  },
  {
    name: 'Villanova',
    fileName: 'villanova_total.json',
    category: 'townhouses',
    
  },
  {
    name: 'Tilal Al Ghaf',
    fileName: 'tilal_al_ghaf_total.json',
    category: 'townhouses',
    
  },
  {
    name: 'The Villa',
    fileName: 'the_villa_total.json',
    category: 'villas',
    
  },
  {
    name: 'Jumeirah Park',
    fileName: 'Jumeirah_park_total.json',
    category: 'townhouses',
    
  },
  {
    name: 'The Springs',
    fileName: 'the_springs_total.json',
    category: 'townhouses',
    
  },

  // Apartments
  {
    name: 'Al Jaddaf',
    fileName: 'al_jaddaf_total.json',
    category: 'apartments',
   
  },
  {
    name: 'Downtown Dubai',
    fileName: 'downtown_dubai_total.json',
    category: 'apartments',
    
  },
  {
    name: 'Business Bay',
    fileName: 'business_bay_total.json',
    category: 'apartments',
    
  },
  {
    name: 'Al Kifaf',
    fileName: 'al_kifaf_total.json',
    category: 'apartments',
    
  },
  {
    name: 'Dubai Marina',
    fileName: 'dubai_marina_total.json',
    category: 'apartments',
    
  },
  {
    name: 'DIFC',
    fileName: 'difc_total.json',
    category: 'apartments',
    
  },
  {
    name: 'Jumeirah Garden City',
    fileName: 'jumeirah_garden_city_total.json',
    category: 'apartments',
    
  },
  {
    name: 'District One Residences',
    fileName: 'district_one_residences_total.json',
    category: 'apartments',
  
  },
  // JVC Apartments
  {
    name: 'Jumeirah Village Circle',
    fileName: 'jvc_total.json',
    category: 'apartments',
    
  },
  // Mina Rashid
  {
    name: 'Mina Rashid',
    fileName: 'mina_rashid_total.json',
    category: 'apartments'
  },
  {
    name: 'Mina Rashid Marina Place',
    fileName: 'marina_place_total.json',
    category: 'apartments'
  },
  {
    name: 'Dubai Maritime City',
    fileName: 'dubai_maritime_city_total.json',
    category: 'apartments'
  }
];

export const VILLA_AREAS = AREAS.filter(area => area.category === 'villas');
export const APARTMENT_AREAS = AREAS.filter(area => area.category === 'apartments');
export const TOWNHOUSE_AREAS = AREAS.filter(area => area.category === 'townhouses');
// Note: 'url' property is not part of AreaInfo type and will be ignored by TypeScript.
