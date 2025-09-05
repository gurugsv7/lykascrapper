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
  },
  // Newly added areas
  {
    name: 'Damac Hills 2',
    fileName: 'damac_hills_2_total.json',
    category: 'townhouses'
  },
  {
    name: 'Reem',
    fileName: 'reem_total.json',
    category: 'townhouses'
  },
  {
    name: 'Arabian Ranches 2',
    fileName: 'arabian_ranches_2_total.json',
    category: 'townhouses'
  },
  {
    name: 'Serena',
    fileName: 'serena_total.json',
    category: 'townhouses'
  },
  {
    name: 'Motor City',
    fileName: 'motor_city_total.json',
    category: 'apartments'
  },
  {
    name: 'Arabian Ranches',
    fileName: 'arabian_ranches_total.json',
    category: 'townhouses'
  },
  // Commercials
  {
    name: 'Business Bay Commercial',
    fileName: 'business_bay_commercial_total.json',
    category: 'commercials'
  },
  {
    name: 'Tecom',
    fileName: 'tecom_total.json',
    category: 'commercials'
  },
  {
    name: 'MBR City',
    fileName: 'MBR_city_total.json',
    category: 'apartments'
  },
  {
    name: 'Majan',
    fileName: 'majan_total.json',
    category: 'apartments'
  },
  {
    name: 'Dubai Production City',
    fileName: 'dubai_production_city_total.json',
    category: 'apartments'
  },
  {
    name: 'Dubai Residence Complex',
    fileName: 'dubai_land_residence_complex_total.json',
    category: 'apartments'
  },
  {
    name: 'Liwan',
    fileName: 'liwan_total.json',
    category: 'apartments'
  },
];

export const VILLA_AREAS = AREAS.filter(area => area.category === 'villas');
export const APARTMENT_AREAS = AREAS.filter(area => area.category === 'apartments');
export const TOWNHOUSE_AREAS = AREAS.filter(area => area.category === 'townhouses');
export const COMMERCIAL_AREAS = AREAS.filter(area => area.category === 'commercials');
// Note: 'url' property is not part of AreaInfo type and will be ignored by TypeScript.
