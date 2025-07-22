import React from 'react';
import { AreaInfo } from '../types/Property';
import { Home, Building2, ChevronDown } from 'lucide-react';

interface AreaFilterProps {
  areas: AreaInfo[];
  selectedArea: string | null;
  onAreaSelect: (areaName: string | null) => void;
  selectedCategory: 'all' | 'villas' | 'townhouses' | 'apartments' | 'villaTownhouse';
  onCategoryChange: (category: 'all' | 'villas' | 'townhouses' | 'apartments' | 'villaTownhouse') => void;
}

export const AreaFilter: React.FC<AreaFilterProps> = ({
  areas,
  selectedArea,
  onAreaSelect,
  selectedCategory,
  onCategoryChange
}) => {
  const villaAreas = areas.filter(area => area.category === 'villas');
  const townhouseAreas = areas.filter(area => area.category === 'townhouses');
  const apartmentAreas = areas.filter(area => area.category === 'apartments');
  const villaTownhouseAreas = areas.filter(area => area.category === 'villas' || area.category === 'townhouses');

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Filter by Area</h3>
      
      {/* Category Toggle */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 sm:mb-6">
        <button
          onClick={() => onCategoryChange('all')}
          className={`
            flex items-center justify-center gap-1 py-2.5 sm:py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
            ${selectedCategory === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          All
        </button>
        <button
          onClick={() => onCategoryChange('villaTownhouse')}
          className={`
            flex items-center justify-center gap-1 py-2.5 sm:py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
            ${selectedCategory === 'villaTownhouse'
              ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <Home className="w-3 h-3 sm:w-4 sm:h-4" />
          Villas & Townhouses
        </button>
        <button
          onClick={() => onCategoryChange('apartments')}
          className={`
            flex items-center justify-center gap-1 py-2.5 sm:py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
            ${selectedCategory === 'apartments'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
          Apartments
        </button>
      </div>

      {/* Area Dropdowns */}
      {(selectedCategory === 'all' || selectedCategory === 'villaTownhouse') && villaTownhouseAreas.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            <Home className="w-4 h-4 inline mr-1" />
            Villas & Townhouses
          </label>
          <div className="relative">
            <select
              value={selectedArea && villaTownhouseAreas.find(a => a.name === selectedArea) ? selectedArea : ''}
              onChange={(e) => onAreaSelect(e.target.value || null)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8"
            >
              <option value="">Select villa and townhouse area...</option>
              {villaTownhouseAreas.map((area) => (
                <option key={area.name} value={area.name}>
                  {area.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {(selectedCategory === 'all' || selectedCategory === 'apartments') && apartmentAreas.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4 inline mr-1" />
            Apartments
          </label>
          <div className="relative">
            <select
              value={selectedArea && apartmentAreas.find(a => a.name === selectedArea) ? selectedArea : ''}
              onChange={(e) => onAreaSelect(e.target.value || null)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8"
            >
              <option value="">Select apartment area...</option>
              {apartmentAreas.map((area) => (
                <option key={area.name} value={area.name}>
                  {area.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}


      {selectedArea && (
        <button
          onClick={() => onAreaSelect(null)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 sm:py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Clear Selection
        </button>
      )}
    </div>
  );
};