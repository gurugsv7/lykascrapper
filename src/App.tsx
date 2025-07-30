import React, { useState, useEffect } from 'react';
import { AREAS } from './data/areas';
import { AreaData, Property } from './types/Property';
import { fetchAreaData } from './services/supabaseClient';
import { PropertyCard } from './components/PropertyCard';
import { AreaFilter } from './components/AreaFilter';
import { SummaryStats } from './components/SummaryStats';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Building, Star, Database, Search } from 'lucide-react';

function App() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'villas' | 'townhouses' | 'apartments' | 'villaTownhouse'>('all');
  const [loadedAreas, setLoadedAreas] = useState<{ [key: string]: AreaData }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<'all' | 'villas' | 'townhouses'>('all');

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
  const currentProperties = selectedArea && loadedAreas[selectedArea] 
    ? loadedAreas[selectedArea].properties 
    : [];

  // Filter properties based on search term
  const filteredProperties = currentProperties
    .filter(property => {
      if (!searchTerm) return true;
      
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
      return buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             property.location.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter(property => {
      if (!selectedBedrooms) return true;
      // Normalize both values for comparison
      const propertyBedrooms = parseInt(property.bedroom_count).toString();
      const selectedNormalized = parseInt(selectedBedrooms).toString();
      return propertyBedrooms === selectedNormalized;
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

  // Sort so today's listings come first
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    const aToday = isPostedToday(a.posted_date);
    const bToday = isPostedToday(b.posted_date);
    if (aToday && !bToday) return -1;
    if (!aToday && bToday) return 1;
    return 0;
  });

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
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
              <Building className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Lyka Scrapper</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">Dubai Real Estate Property Listings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Summary Stats */}
        <SummaryStats loadedAreas={loadedAreas} totalAreas={AREAS.length} />

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

            {/* Supabase Connection Status */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Source
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
                      ? 'text-green-600' 
                      : 'text-orange-600'
                  }`}>
                    {import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
                      ? 'Connected' 
                      : 'Not Connected'
                    }
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
                    ? 'Ready to load property data from Supabase Storage'
                    : 'Click "Connect to Supabase" to set up your backend'
                  }
                </div>
              </div>
            </div>
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

            {selectedArea && loadedAreas[selectedArea] && !loading && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Properties in {selectedArea}
                  </h2>
                  <div className="text-sm sm:text-base text-gray-600">
                    {filteredProperties.length} of {currentProperties.length} properties
                  </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by building name, title, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    />
                  </div>
                </div>

                {/* Bedroom and Property Type Filter */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Bedrooms
                      </label>
                      <select
                        value={selectedBedrooms}
                        onChange={(e) => setSelectedBedrooms(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        <option value="">All Bedrooms</option>
                        {getBedroomOptions().map((bedroom) => (
                          <option key={bedroom} value={bedroom}>
                            {bedroom} Bedroom{bedroom !== '1' ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Property Type Filter: Only show if selected area is villa/townhouse */}
                    {(() => {
                      const areaObj = AREAS.find(a => a.name === selectedArea);
                      if (areaObj && (areaObj.category === 'villas' || areaObj.category === 'townhouses')) {
                        return (
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Property Type
                            </label>
                            <select
                              value={selectedPropertyType}
                              onChange={e => setSelectedPropertyType(e.target.value as 'all' | 'villas' | 'townhouses')}
                              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                            >
                              <option value="all">All</option>
                              <option value="villas">Only Villas</option>
                              <option value="townhouses">Only Townhouses</option>
                            </select>
                          </div>
                        );
                      }
                      // Hide and reset property type filter if not villa/townhouse
                      if (selectedPropertyType !== 'all') {
                        setSelectedPropertyType('all');
                      }
                      return null;
                    })()}
                    {(searchTerm || selectedBedrooms) && (
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedBedrooms('');
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
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
                      {(searchTerm || selectedBedrooms) ? 'No properties match your filters.' : 'No properties found in this area.'}
                    </p>
                    {(searchTerm || selectedBedrooms) && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedBedrooms('');
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {!selectedArea && !loading && (
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
