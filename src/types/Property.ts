export interface Property {
  title: string;
  price: string;
  price_number: number;
  location: string;
  property_type: string;
  beds: string;
  bedroom_count: string;
  size: string;
  link: string;
  building_url: string;
  posted_date: string;
  price_per_sqft?: number;
}

export interface AreaData {
  areaName: string;
  properties: Property[];
  lastUpdated: string;
  totalListings: number;
  lowestPrice: number;
  averagePrice: number;
}

export interface AreaInfo {
  name: string;
  fileName: string;
  category: 'villas' | 'townhouses' | 'apartments' | 'commercials';
}
