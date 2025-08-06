import React, { useState, useEffect } from 'react';
import { AREAS } from './data/areas';
import { AreaData, Property } from './types/Property';
import { fetchAreaData } from './services/supabaseClient';
import { PropertyCard } from './components/PropertyCard';
import { AreaFilter } from './components/AreaFilter';
import { SummaryStats } from './components/SummaryStats';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Building, Star, Database, Search } from 'lucide-react';
import { PropertyFilter } from './components/PropertyFilter';

function App() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'villas' | 'townhouses' | 'apartments' | 'villaTownhouse'>('all');
  const [loadedAreas, setLoadedAreas] = useState<{ [key: string]: AreaData }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(''); // For GPT/global search
  const [buildingSearchTerm, setBuildingSearchTerm] = useState<string>(''); // For area-specific building search
  const [bedrooms, setBedrooms] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<'all' | 'villas' | 'townhouses'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(''); // '', 'today', '7days', '30days'
  const [sortDate, setSortDate] = useState<string>('default'); // 'default', 'newest', 'oldest'

  // On first mount, load all areas for global search
  React.useEffect(() => {
    (async () => {
      for (const area of AREAS) {
        if (!loadedAreas[area.name]) {
          await loadAreaData(area.name);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter areas based on selected category
  const filteredAreas = AREAS.filter(area => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'villaTownhouse') return area.category === 'villas' || area.category === 'townhouses';
    return area.category === selectedCategory;
  });

  // Load area data
  const loadAreaData = async (areaName: string) => {
    if (loadedAreas[areaName]) {
      return; // Already loaded
    }

    setLoading(true);
    setError(null);

    try {
      const area = AREAS.find(a => a.name === areaName);
      if (!area) {
        throw new Error('Area not found');
      }

      const data = await fetchAreaData(area.fileName);
      
      if (!data) {
        throw new Error('Failed to fetch area data');
      }

      setLoadedAreas(prev => ({
        ...prev,
        [areaName]: data
      }));
    } catch (err) {
      setError(`Failed to load data for ${areaName}. Make sure the JSON file exists in Supabase Storage.`);
      console.error('Error loading area data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle area selection
  const handleAreaSelect = async (areaName: string | null) => {
    setSelectedArea(areaName);
    // Reset property type filter if area is not villa/townhouse
    const areaObj = AREAS.find(a => a.name === areaName);
    if (!areaObj || (areaObj.category !== 'villas' && areaObj.category !== 'townhouses')) {
      setSelectedPropertyType('all');
    }
    if (areaName) {
      await loadAreaData(areaName);
    }
  };

  // Get current properties
  // For global search, aggregate all properties if no area is selected
  const currentProperties =
    selectedArea && loadedAreas[selectedArea]
      ? loadedAreas[selectedArea].properties
      : !selectedArea
        ? Object.values(loadedAreas).flatMap(area => area.properties)
        : [];

  // Filter properties based on search term
  // For GPT search, extract bedrooms and property type from searchTerm if present
  const gptBedrooms =
    searchTerm &&
    (() => {
      const match = searchTerm.match(/(\d+)\s*bed(room)?/);
      return match ? Number(match[1]) : null;
    })();

  const gptType =
    searchTerm &&
    (() => {
      if (searchTerm.toLowerCase().includes("villa")) return "villas";
      if (searchTerm.toLowerCase().includes("townhouse")) return "townhouses";
      if (searchTerm.toLowerCase().includes("apartment")) return "apartment";
      return null;
    })();

  // Robust NLP: extract area/building from AREAS or after NLP keywords
  const gptArea = searchTerm &&
    (() => {
      const lower = searchTerm.toLowerCase();
      // Try to match known area names (case-insensitive, multi-word)
      const areaMatch = AREAS.find(a => lower.includes(a.name.toLowerCase()));
      if (areaMatch) return areaMatch.name.toLowerCase();
      // Try after NLP keywords
      const areaRegex = /\b(?:in|from|at|near|around|within|by|beside|inside|to|for)\s+([a-zA-Z0-9\s\-']+)/;
      const match = lower.match(areaRegex);
      return match ? match[1].trim().toLowerCase() : '';
    })();

  // Robust NLP: extract building name (if not an area)
  const gptBuilding = searchTerm &&
    (() => {
      const lower = searchTerm.toLowerCase();
      // If area already matched, skip
      if (gptArea && lower.includes(gptArea)) return '';
      // Try after NLP keywords
      const buildingRegex = /\b(?:in|from|at|near|around|within|by|beside|inside|to|for)\s+([a-zA-Z0-9\s\-']+)/;
      const match = lower.match(buildingRegex);
      return match ? match[1].trim().toLowerCase() : '';
    })();

  const filteredProperties = currentProperties
    .filter(property => {
      // If global GPT search is active, apply NLP filters
      if (searchTerm && (gptArea || gptBuilding || gptBedrooms || gptType)) {
        const building = (property.building_url || '').toLowerCase();
        const title = (property.title || '').toLowerCase();
        const location = (property.location || '').toLowerCase();
        let areaMatch = true, buildingMatch = true, bedroomMatch = true, typeMatch = true;

        // Normalize for robust matching
        const normalize = (str: string) => str.replace(/[\s\-']/g, '').toLowerCase();

        if (gptArea) {
          const normArea = normalize(gptArea);
          areaMatch =
            normalize(building).includes(normArea) ||
            normalize(title).includes(normArea) ||
            normalize(location).includes(normArea);
        }
        if (gptBuilding) {
          const normBuilding = normalize(gptBuilding);
          buildingMatch =
            normalize(building).includes(normBuilding) ||
            normalize(title).includes(normBuilding) ||
            normalize(location).includes(normBuilding);
        }
        if (gptBedrooms) {
          const propertyBedrooms = parseInt(property.bedroom_count);
          bedroomMatch = propertyBedrooms === gptBedrooms;
        }
        if (gptType) {
          const type = property.property_type?.toLowerCase() || '';
          if (gptType === "apartment") {
            typeMatch = type.includes("apartment") || type.includes("apartments");
          } else {
            typeMatch = type.includes(gptType);
          }
        }
        // Require ALL present GPT filters to match (AND logic)
        if (gptArea && !areaMatch) return false;
        if (gptBuilding && !buildingMatch) return false;
        if (gptBedrooms && !bedroomMatch) return false;
        if (gptType && !typeMatch) return false;
        return true;
      }
      // Otherwise, use area-specific building search
      if (!buildingSearchTerm) return true;

      const extractBuildingName = (buildingUrl: string) => {
        try {
          const parts = buildingUrl.split('/');
          const buildingPart = parts[parts.length - 2] || parts[parts.length - 1];
          return buildingPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        } catch {
          return '';
        }
      };

      const buildingName = extractBuildingName(property.building_url);
      return buildingName.toLowerCase().includes(buildingSearchTerm.toLowerCase()) ||
             property.title.toLowerCase().includes(buildingSearchTerm.toLowerCase()) ||
             property.location.toLowerCase().includes(buildingSearchTerm.toLowerCase());
    })
    .filter(property => {
      if (!bedrooms) return true;
      const propertyBedrooms = parseInt(property.bedroom_count);
      return propertyBedrooms === bedrooms;
    })
    .filter(property => {
      if (selectedPropertyType === 'all') return true;
      // Filter by property_type field (case-insensitive)
      const type = property.property_type?.toLowerCase() || '';
      if (selectedPropertyType === 'villas') {
        return type.includes('villa');
      }
      if (selectedPropertyType === 'townhouses') {
        return type.includes('townhouse');
      }
      return true;
    })
    .filter(property => {
      if (!selectedDate) return true;
      const posted = new Date(property.posted_date);
      const now = new Date();
      if (selectedDate === 'today') {
        return (
          posted.getDate() === now.getDate() &&
          posted.getMonth() === now.getMonth() &&
          posted.getFullYear() === now.getFullYear()
        );
      }
      if (selectedDate === '7days') {
        const diff = (now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }
      if (selectedDate === '30days') {
        const diff = (now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 30;
      }
      return true;
    })
    .filter(property => {
      const price = Number(property.price?.toString().replace(/[^0-9.]/g, '')) || 0;
      if (minPrice && price < minPrice) return false;
      if (maxPrice && price > maxPrice) return false;
      return true;
    });

  // Helper: Check if posted_date is today
  const isPostedToday = (postedDate: string) => {
    try {
      const today = new Date();
      const date = new Date(postedDate);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    } catch {
      return false;
    }
  };

 // Sort properties by date if requested
 let sortedProperties = [...filteredProperties];
 if (sortDate === 'newest') {
   sortedProperties.sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime());
 } else if (sortDate === 'oldest') {
   sortedProperties.sort((a, b) => new Date(a.posted_date).getTime() - new Date(b.posted_date).getTime());
 } else {
   // Default: today's listings first, then others
   sortedProperties.sort((a, b) => {
     const aToday = isPostedToday(a.posted_date);
     const bToday = isPostedToday(b.posted_date);
     if (aToday && !bToday) return -1;
     if (!aToday && bToday) return 1;
     return 0;
   });
 }

  // Get unique bedroom counts for filter options
  const getBedroomOptions = () => {
    if (!currentProperties.length) return [];
    const bedrooms = [...new Set(currentProperties.map(p => {
      // Normalize bedroom count - convert "0001" to "1", etc.
      const normalized = parseInt(p.bedroom_count).toString();
      return isNaN(parseInt(p.bedroom_count)) ? p.bedroom_count : normalized;
    }))];
    return bedrooms.filter(b => b && b !== '').sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (isNaN(numA) || isNaN(numB)) {
        return a.localeCompare(b);
      }
      return numA - numB;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3 justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                <Building className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Lyka Scrapper</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">Dubai Real Estate Property Listings</p>
              </div>
            </div>
            {/* Data Source Status Indicator */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
                title={
                  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
                    ? 'Connected to Supabase'
                    : 'Not Connected'
                }
              ></span>
              <span className="text-xs text-gray-600">
                {import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
                  ? 'Data Source Connected'
                  : 'Data Source Not Connected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Summary Stats */}
        <SummaryStats loadedAreas={loadedAreas} totalAreas={AREAS.length} />
        {/* ChatGPT-like Search Input */}
        <div className="mt-6 mb-6 flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={async e => {
              if (e.key === "Enter") {
                const input = e.target as HTMLInputElement;
                let q = input.value.toLowerCase();

                // Always clear all filters first
                setBedrooms(null);
                setMinPrice(null);
                setMaxPrice(null);
                setSelectedPropertyType('all');
                setSelectedDate('');
                setSortDate('default');

                // Extract bedrooms
                const bedMatch = q.match(/(\d+)\s*bed(room)?/);
                if (bedMatch) setBedrooms(Number(bedMatch[1]));
                // Extract property type
                if (q.includes("apartment")) setSelectedPropertyType("all");
                else if (q.includes("villa")) setSelectedPropertyType("villas");
                else if (q.includes("townhouse")) setSelectedPropertyType("townhouses");
                // Extract min/max price
                const priceRange = q.match(/(\d[\d,]*)\s*(?:aed)?\s*(?:to|-|–|—)\s*(\d[\d,]*)\s*(?:aed)?/);
                if (priceRange) {
                  setMinPrice(Number(priceRange[1].replace(/,/g, "")));
                  setMaxPrice(Number(priceRange[2].replace(/,/g, "")));
                } else {
                  const minMatch = q.match(/(?:from|starting at|start at|above|over)\s*(\d[\d,]*)/);
                  if (minMatch) setMinPrice(Number(minMatch[1].replace(/,/g, "")));
                  const maxMatch = q.match(/(?:up to|below|under|less than|maximum|max)\s*(\d[\d,]*)/);
                  if (maxMatch) setMaxPrice(Number(maxMatch[1].replace(/,/g, "")));
                }
                // Global search: clear area selection to show all
                setSelectedArea(null);
                // Load all areas if not loaded
                for (const area of AREAS) {
                  if (!loadedAreas[area.name]) {
                    await loadAreaData(area.name);
                  }
                }
              }
            }}
            placeholder="Ask for properties e.g. '3 bedroom apartments within 1000000 to 2000000 AED...'"
            className="flex-1 bg-white border border-gray-300 rounded px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={async () => {
              // Always clear all filters first
              setBedrooms(null);
              setMinPrice(null);
              setMaxPrice(null);
              setSelectedPropertyType('all');
              setSelectedDate('');
              setSortDate('default');

              // Load all areas before running GPT search
              for (const area of AREAS) {
                if (!loadedAreas[area.name]) {
                  await loadAreaData(area.name);
                }
              }
              let q = searchTerm.toLowerCase();
              const bedMatch = q.match(/(\d+)\s*bed(room)?/);
              if (bedMatch) setBedrooms(Number(bedMatch[1]));
              if (q.includes("apartment")) setSelectedPropertyType("all");
              else if (q.includes("villa")) setSelectedPropertyType("villas");
              else if (q.includes("townhouse")) setSelectedPropertyType("townhouses");
              const priceRange = q.match(/(\d[\d,]*)\s*(?:aed)?\s*(?:to|-|–|—)\s*(\d[\d,]*)\s*(?:aed)?/);
              if (priceRange) {
                setMinPrice(Number(priceRange[1].replace(/,/g, "")));
                setMaxPrice(Number(priceRange[2].replace(/,/g, "")));
              } else {
                const minMatch = q.match(/(?:from|starting at|start at|above|over)\s*(\d[\d,]*)/);
                if (minMatch) setMinPrice(Number(minMatch[1].replace(/,/g, "")));
                const maxMatch = q.match(/(?:up to|below|under|less than|maximum|max)\s*(\d[\d,]*)/);
                if (maxMatch) setMaxPrice(Number(maxMatch[1].replace(/,/g, "")));
              }
              setSelectedArea(null);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:py-3 rounded transition-colors duration-200"
            aria-label="Search"
          >
            🔍
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <AreaFilter
              areas={filteredAreas}
              selectedArea={selectedArea}
              onAreaSelect={handleAreaSelect}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Properties */}
            {loading && <LoadingSpinner />}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                <p className="text-red-800">{error}</p>
                <p className="text-red-600 text-xs sm:text-sm mt-2">
                  Make sure you've uploaded the JSON file to your Supabase Storage bucket named 'real-estate-data'.
                </p>
              </div>
            )}

            <>
              {currentProperties.length > 0 && !loading ? (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {selectedArea ? `Properties in ${selectedArea}` : "All Properties"}
                    </h2>
                    <div className="text-sm sm:text-base text-gray-600">
                      {filteredProperties.length} of {currentProperties.length} properties
                    </div>
                  </div>
                  {/* Search Bar */}
                  {selectedArea && (
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by building name, title, or location..."
                          value={buildingSearchTerm}
                          onChange={(e) => setBuildingSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                        />
                      </div>
                    </div>
                  )}
                  {/* Property Filters */}
                  <div className="mb-6">
                    <PropertyFilter
                      isAreaSelected={!!selectedArea}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      bedrooms={bedrooms}
                      sortDate={sortDate}
                      onPriceChange={(min, max) => {
                        setMinPrice(min);
                        setMaxPrice(max);
                      }}
                      onBedroomChange={setBedrooms}
                      onSortDateChange={setSortDate}
                    />
                  </div>
                  {sortedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                      {sortedProperties.map((property, index) => (
                        <PropertyCard
                          key={`${property.link}-${index}`}
                          property={property}
                          areaCategory={
                            (() => {
                              const areaObj = AREAS.find(a => a.name === selectedArea);
                              return areaObj ? areaObj.category : undefined;
                            })()
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm sm:text-base text-gray-600">
                        {(buildingSearchTerm || bedrooms || selectedDate || minPrice || maxPrice) ? 'No properties match your filters.' : 'No properties found.'}
                      </p>
                      {(buildingSearchTerm || bedrooms || selectedDate || minPrice || maxPrice) && (
                        <button
                          onClick={() => {
                            setBuildingSearchTerm('');
                            setBedrooms(null);
                            setMinPrice(null);
                            setMaxPrice(null);
                            setSelectedDate('');
                            setSortDate('default');
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Welcome to Lyka Scrapper
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-6 px-4">
                    Select an area from the filters to explore premium properties
                    across Dubai's most exclusive neighborhoods.
                  </p>
                </div>
              )}
            </>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
