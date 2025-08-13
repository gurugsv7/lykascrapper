import { useState, useEffect } from 'react';
// Add PropertyFilter import above
import { AREAS } from './data/areas';
import { AreaData } from './types/Property';
import { fetchAreaData } from './services/supabaseClient';
import { PropertyCard } from './components/PropertyCard';
import { AreaFilter } from './components/AreaFilter';
import { PropertyFilter } from './components/PropertyFilter';
import { SummaryStats } from './components/SummaryStats';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Building, Star, Database, Search } from 'lucide-react';

function App() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'apartments' | 'villaTownhouse'>('all');
  const [loadedAreas, setLoadedAreas] = useState<{ [key: string]: AreaData }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBedrooms, setSelectedBedrooms] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(''); // '', 'today', '7days', '30days'
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<'all' | 'apartments' | 'villaTownhouse'>('all');
  const [sortDate, setSortDate] = useState<string>('default'); // 'default', 'newest', 'oldest'
  const [sortPrice, setSortPrice] = useState<string>('default'); // 'default', 'highToLow', 'lowToHigh'
  const [buildingSearchTerm, setBuildingSearchTerm] = useState<string>(''); // for listing search bar
  const [cancelLoading, setCancelLoading] = useState<boolean>(false);

  // Incrementally load all areas on mount, but allow cancellation
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const area of AREAS) {
        if (cancelled) break;
        if (!loadedAreas[area.name]) {
          await loadAreaData(area.name);
        }
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelLoading]);

  // When a filter or GPT search for a specific area is performed, cancel background loading and load only that area
  const handleAreaOrGPTSearch = async (areaName: string | null) => {
    setCancelLoading(c => !c); // trigger cancellation of background loading
    if (areaName) {
      await loadAreaData(areaName);
      setSelectedArea(areaName);
    } else {
      setSelectedArea(null);
    }
  };

  // Filter areas based on selected category
  const filteredAreas = AREAS.filter(area => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'villaTownhouse') return area.category === 'villas' || area.category === 'townhouses';
    if (selectedCategory === 'apartments') return area.category === 'apartments';
    return false;
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
    await handleAreaOrGPTSearch(areaName);
  };

  // Get current properties
  // Aggregate all properties if no area is selected, else show selected area
  const currentProperties =
    selectedArea && loadedAreas[selectedArea]
      ? loadedAreas[selectedArea].properties
      : !selectedArea
        ? Object.values(loadedAreas).flatMap(area => area.properties)
        : [];

  // Show all loaded properties at start, even if loading is ongoing
  const hasAnyProperties = Object.values(loadedAreas).some(area => area.properties && area.properties.length > 0);

  // Filter properties based on search term
  const filteredProperties = currentProperties
    .filter(property => {
      // Category filter (property type)
      if (selectedCategory !== "all") {
        const type = property.property_type?.toLowerCase() || '';
        if (selectedCategory === "apartments" && !type.includes("apartment")) return false;
        if (selectedCategory === "villaTownhouse" && !(type.includes("villa") || type.includes("townhouse"))) return false;
      }
      return true;
    })
    .filter(property => {
      // Use buildingSearchTerm for the listing search bar only
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
      if (!selectedBedrooms) return true;
      // Normalize both values for comparison
      const propertyBedrooms = parseInt(property.bedroom_count).toString();
      const selectedNormalized = parseInt(selectedBedrooms).toString();
      return propertyBedrooms === selectedNormalized;
    })
    // Filter by date
    .filter(property => {
      if (!selectedDate) return true;
      const date = new Date(property.posted_date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      switch(selectedDate) {
        case 'today':
          return diffDays < 1;
        case '7days':
          return diffDays <= 7;
        case '30days':
          return diffDays <= 30;
        default:
          return true;
      }
    })
    // Filter by price range
    .filter(property => {
      const price = parseInt(property.price.replace(/[^0-9]/g, ''));
      const min = minPrice ? parseInt(minPrice) * 1000000 : null;
      const max = maxPrice ? parseInt(maxPrice) * 1000000 : null;
      
      if (min && max) return price >= min && price <= max;
      if (min) return price >= min;
      if (max) return price <= max;
      return true;
    })
    // Sort by date
    .sort((a, b) => {
      if (sortDate === 'newest') {
        return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
      } else if (sortDate === 'oldest') {
        return new Date(a.posted_date).getTime() - new Date(b.posted_date).getTime();
      }
      return 0;
    })
    // Sort by price
    .sort((a, b) => {
      if (sortPrice === 'highToLow') {
        return parseInt(b.price.replace(/[^0-9]/g, '')) - parseInt(a.price.replace(/[^0-9]/g, ''));
      } else if (sortPrice === 'lowToHigh') {
        return parseInt(a.price.replace(/[^0-9]/g, '')) - parseInt(b.price.replace(/[^0-9]/g, ''));
      }
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

        {/* Property Filter Bar */}
        <div className="my-4">
          <PropertyFilter
            isAreaSelected={true}
            minPrice={minPrice ? parseInt(minPrice) : null}
            maxPrice={maxPrice ? parseInt(maxPrice) : null}
            bedrooms={selectedBedrooms ? parseInt(selectedBedrooms) : null}
            sortDate={sortDate}
            sortPrice={sortPrice}
            onPriceChange={(min, max) => {
              setMinPrice(min !== null ? min.toString() : '');
              setMaxPrice(max !== null ? max.toString() : '');
            }}
            onBedroomChange={beds => setSelectedBedrooms(beds !== null ? beds.toString() : '')}
            onSortDateChange={setSortDate}
            onSortPriceChange={setSortPrice}
          />
        </div>

        {/* GPT-like Search Input */}
        <div className="mt-6 mb-6 flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={async e => {
              if (e.key === "Enter") {
                setSelectedBedrooms('');
                let q = e.currentTarget.value.toLowerCase();

                // Date parsing
                const todayMatch = q.match(/today/);
                const last7DaysMatch = q.match(/last\s*7\s*days/);
                const last30DaysMatch = q.match(/last\s*30\s*days/);
                const dateMatch = q.match(/on\s*(\d{1,2})(st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?/);

                if (todayMatch) {
                  setSelectedDate('today');
                } else if (last7DaysMatch) {
                  setSelectedDate('7days');
                } else if (last30DaysMatch) {
                  setSelectedDate('30days');
                } else if (dateMatch) {
                  // Parse date like "on 13th august"
                  const day = dateMatch[1];
                  const month = dateMatch[3];
                  const year = new Date().getFullYear();
                  const dateStr = `${day} ${month} ${year}`;
                  setSelectedDate(dateStr);
                } else {
                  setSelectedDate('');
                }

                // Price parsing
                const priceRangeMatch = q.match(/(?:range|between)\s*(\d+\.?\d*)\s*m?\s*(?:to|and|-)\s*(\d+\.?\d*)\s*m?/);
                const underMatch = q.match(/under\s*(\d+\.?\d*)\s*m?/);
                const aboveMatch = q.match(/above\s*(\d+\.?\d*)\s*m?/);

                if (priceRangeMatch) {
                  setMinPrice(priceRangeMatch[1]);
                  setMaxPrice(priceRangeMatch[2]);
                } else if (underMatch) {
                  setMinPrice('');
                  setMaxPrice(underMatch[1]);
                } else if (aboveMatch) {
                  setMinPrice(aboveMatch[1]);
                  setMaxPrice('');
                } else {
                  // fallback: clear price filters if not found
                  setMinPrice('');
                  setMaxPrice('');
                }

                // Example GPT parsing: extract bedrooms, property type, and area
                const bedMatch = q.match(/(\d+)\s*bed(room)?/);
                if (bedMatch) setSelectedBedrooms(bedMatch[1]);
                // Property type extraction
                if (q.includes("apartment")) setSelectedCategory("apartments");
                else if (q.includes("villa") || q.includes("townhouse")) setSelectedCategory("villaTownhouse");
                else setSelectedCategory("all");
                // Area extraction (simple): look for "in AREA"
                const areaMatch = q.match(/in\s+([a-zA-Z\s]+)/);
                if (areaMatch) {
                  // Try exact match, then partial, then acronym
                  const inputArea = areaMatch[1].trim().toLowerCase();
                  let areaObj = AREAS.find(a => a.name.toLowerCase() === inputArea);
                  if (!areaObj) {
                    areaObj = AREAS.find(a => a.name.toLowerCase().includes(inputArea));
                  }
                  if (!areaObj) {
                    // Acronym match (e.g., "jvc" for "Jumeirah Village Circle")
                    areaObj = AREAS.find(a => {
                      const acronym = a.name.split(/\s+/).map(w => w[0]).join('').toLowerCase();
                      return acronym === inputArea;
                    });
                  }
                  if (areaObj) {
                    await handleAreaOrGPTSearch(areaObj.name);
                    return;
                  }
                }
                // If no area, show all
                await handleAreaOrGPTSearch(null);
              }
            }}
            placeholder="Ask for properties e.g. '3 bedroom apartment in dubai marina'"
            className="flex-1 bg-white border border-gray-300 rounded px-2 md:px-3 py-2 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={async () => {
              setSelectedBedrooms('');
              let q = searchTerm.toLowerCase();

              // Date parsing
              const todayMatch = q.match(/today/);
              const last7DaysMatch = q.match(/last\s*7\s*days/);
              const last30DaysMatch = q.match(/last\s*30\s*days/);
              const dateMatch = q.match(/on\s*(\d{1,2})(st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?/);

              if (todayMatch) {
                setSelectedDate('today');
              } else if (last7DaysMatch) {
                setSelectedDate('7days');
              } else if (last30DaysMatch) {
                setSelectedDate('30days');
              } else if (dateMatch) {
                // Parse date like "on 13th august"
                const day = dateMatch[1];
                const month = dateMatch[3];
                const year = new Date().getFullYear();
                const dateStr = `${day} ${month} ${year}`;
                setSelectedDate(dateStr);
              } else {
                setSelectedDate('');
              }

              // Price parsing
              const priceRangeMatch = q.match(/(?:range|between)\s*(\d+\.?\d*)\s*m?\s*(?:to|and|-)\s*(\d+\.?\d*)\s*m?/);
              const underMatch = q.match(/under\s*(\d+\.?\d*)\s*m?/);
              const aboveMatch = q.match(/above\s*(\d+\.?\d*)\s*m?/);

              if (priceRangeMatch) {
                setMinPrice(priceRangeMatch[1]);
                setMaxPrice(priceRangeMatch[2]);
              } else if (underMatch) {
                setMinPrice('');
                setMaxPrice(underMatch[1]);
              } else if (aboveMatch) {
                setMinPrice(aboveMatch[1]);
                setMaxPrice('');
              } else {
                setMinPrice('');
                setMaxPrice('');
              }

              const bedMatch = q.match(/(\d+)\s*bed(room)?/);
              if (bedMatch) setSelectedBedrooms(bedMatch[1]);
              // Property type extraction
              if (q.includes("apartment")) setSelectedCategory("apartments");
              else if (q.includes("villa") || q.includes("townhouse")) setSelectedCategory("villaTownhouse");
              else setSelectedCategory("all");
              const areaMatch = q.match(/in\s+([a-zA-Z\s]+)/);
              if (areaMatch) {
                // Try exact match, then partial, then acronym
                const inputArea = areaMatch[1].trim().toLowerCase();
                let areaObj = AREAS.find(a => a.name.toLowerCase() === inputArea);
                if (!areaObj) {
                  areaObj = AREAS.find(a => a.name.toLowerCase().includes(inputArea));
                }
                if (!areaObj) {
                  // Acronym match (e.g., "jvc" for "Jumeirah Village Circle")
                  areaObj = AREAS.find(a => {
                    const acronym = a.name.split(/\s+/).map(w => w[0]).join('').toLowerCase();
                    return acronym === inputArea;
                  });
                }
                if (areaObj) {
                  await handleAreaOrGPTSearch(areaObj.name);
                  return;
                }
              }
              await handleAreaOrGPTSearch(null);
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

            {(selectedArea && loadedAreas[selectedArea] && !loading) ||
             (!selectedArea && hasAnyProperties && !loading) ? (
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
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by building name, title, or location..."
                      value={buildingSearchTerm}
                      onChange={(e) => setBuildingSearchTerm(e.target.value)}
                      onKeyDown={e => {
                        // Prevent GPT search logic in this bar
                        if (e.key === "Enter") {
                          // Do nothing special, just let the filter run
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    />
                  </div>
                </div>

                {/* Bedroom Filter */}
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
                {filteredProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredProperties.map((property, index) => (
                      <PropertyCard
                        key={`${property.link}-${index}`}
                        property={property}
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
            ) : null}

            {!selectedArea && !hasAnyProperties && !loading && (
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

        {/* Floating Filter Button and Modal */}
      </main>
    </div>
  );
}

export default App;
