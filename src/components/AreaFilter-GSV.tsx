import React, { useState } from 'react';
import { AreaInfo } from '../types/Property';
import { Home, Building2, ChevronDown, X, Filter } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-3 md:p-6">
      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Area Selection</h3>
      
      {/* Category Toggle */}
      <div className="grid grid-cols-3 gap-1 md:gap-1.5 mb-3 md:mb-4">
        <button
          onClick={() => onCategoryChange('all')}
          className={`
            flex items-center justify-center gap-0.5 md:gap-1 py-1.5 md:py-2 px-1.5 md:px-2 rounded text-[10px] md:text-sm font-medium transition-all duration-200
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
            flex items-center justify-center gap-0.5 md:gap-1 py-1.5 md:py-2 px-1.5 md:px-2 rounded text-[10px] md:text-sm font-medium transition-all duration-200
            ${selectedCategory === 'villaTownhouse'
              ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <Home className="w-3 h-3 md:w-4 md:h-4" />
          Villas & Townhouses
        </button>
        <button
          onClick={() => onCategoryChange('apartments')}
          className={`
            flex items-center justify-center gap-0.5 md:gap-1 py-1.5 md:py-2 px-1.5 md:px-2 rounded text-[10px] md:text-sm font-medium transition-all duration-200
            ${selectedCategory === 'apartments'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <Building2 className="w-3 h-3 md:w-4 md:h-4" />
          Apartments
        </button>
      </div>

      {/* Area Dropdowns */}
      {(selectedCategory === 'all' || selectedCategory === 'villaTownhouse') && villaTownhouseAreas.length > 0 && (
        <div className="mb-2 md:mb-3">
          <label className="block text-[10px] md:text-sm font-medium text-gray-700 mb-1 md:mb-1.5">
            <Home className="w-3 h-3 md:w-4 md:h-4 inline mr-0.5 md:mr-1" />
            Villas & Townhouses
          </label>
          <div className="relative">
            <select
              value={selectedArea && villaTownhouseAreas.find(a => a.name === selectedArea) ? selectedArea : ''}
              onChange={(e) => onAreaSelect(e.target.value || null)}
              className="w-full bg-white border border-gray-300 rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8"
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
        <div className="mb-2 md:mb-3">
          <label className="block text-[10px] md:text-sm font-medium text-gray-700 mb-1 md:mb-1.5">
            <Building2 className="w-3 h-3 md:w-4 md:h-4 inline mr-0.5 md:mr-1" />
            Apartments
          </label>
          <div className="relative">
            <select
              value={selectedArea && apartmentAreas.find(a => a.name === selectedArea) ? selectedArea : ''}
              onChange={(e) => onAreaSelect(e.target.value || null)}
              className="w-full bg-white border border-gray-300 rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8"
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
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 md:py-2 px-3 md:px-4 rounded text-xs md:text-sm font-medium transition-colors duration-200"
        >
          Clear Selection
        </button>
      )}
    </div>
  );
};
