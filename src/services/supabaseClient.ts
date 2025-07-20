import { createClient } from '@supabase/supabase-js';

// These will be provided by Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchAreaData = async (fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('real-estate-data')
      .download(fileName);
    
    if (error) {
      console.error('Error fetching area data:', error);
      return null;
    }
    
    const text = await data.text();
    const properties = JSON.parse(text);
    
    // Transform the raw property array into our AreaData structure
    const areaData = {
      areaName: fileName.replace('.json', '').replace(/_/g, ' '),
      properties: properties,
      lastUpdated: new Date().toISOString(),
      totalListings: properties.length,
      lowestPrice: Math.min(...properties.map((p: any) => p.price_number)),
      averagePrice: Math.round(properties.reduce((sum: number, p: any) => sum + p.price_number, 0) / properties.length)
    };
    
    return areaData;
  } catch (error) {
    console.error('Error parsing area data:', error);
    return null;
  }
};