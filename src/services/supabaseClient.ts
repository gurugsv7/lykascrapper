import { createClient } from '@supabase/supabase-js';

// These will be provided by Supabase connection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchAreaData = async (fileName: string) => {
  try {
    // Get the public URL for the file
    const { data } = supabase.storage
      .from('real-estate-data')
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      console.error('Error fetching area data URL');
      return null;
    }

    // Add cache-busting query param
    const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`;
    const response = await fetch(cacheBustedUrl);
    if (!response.ok) {
      console.error('Error fetching area data:', response.statusText);
      return null;
    }

    const text = await response.text();
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
