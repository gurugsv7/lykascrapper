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
    fileName: 'villanova.json',
    category: 'townhouses',
    
  },
  {
    name: 'Tilal Al Ghaf',
    fileName: 'tilal_al_ghaf.json',
    category: 'townhouses',
    
  },
  {
    name: 'The Villa',
    fileName: 'the_villa.json',
    category: 'villas',
    
  },
  {
    name: 'Jumeirah Park',
    fileName: 'Jumeirah_park.json',
    category: 'townhouses',
    
  },
  {
    name: 'The Springs',
    fileName: 'the_springs.json',
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
    fileName: 'business_bay.json',
    category: 'apartments',
    
  },
  {
    name: 'Al Kifaf',
    fileName: 'al_kifaf.json',
    category: 'apartments',
    
  },
  {
    name: 'Dubai Marina',
    fileName: 'dubai_marina.json',
    category: 'apartments',
    
  },
  {
    name: 'DIFC',
    fileName: 'difc.json',
    category: 'apartments',
    
  },
  {
    name: 'Jumeirah Garden City',
    fileName: 'jumeirah_garden_city.json',
    category: 'apartments',
    
  },
  {
    name: 'District One Residences',
    fileName: 'district_one_residences.json',
    category: 'apartments',
  
  }
];

export const VILLA_AREAS = AREAS.filter(area => area.category === 'villas');
export const APARTMENT_AREAS = AREAS.filter(area => area.category === 'apartments');
export const TOWNHOUSE_AREAS = AREAS.filter(area => area.category === 'townhouses');
