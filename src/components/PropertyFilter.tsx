import React, { useState } from 'react';
import { X, Filter, Home, DollarSign } from 'lucide-react';

interface PropertyFilterProps {
  isAreaSelected: boolean;
  minPrice: string;
  maxPrice: string;
  bedrooms: number | null;
  sortDate: string;
  sortPrice: string;
  onPriceChange: (min: string, max: string) => void;
  onBedroomChange: (beds: number | null) => void;
  onSortDateChange: (sort: string) => void;
  onSortPriceChange: (sort: string) => void;
}

export const PropertyFilter: React.FC<PropertyFilterProps> = ({
  isAreaSelected,
  minPrice,
  maxPrice,
  bedrooms,
  sortDate,
  sortPrice,
  onPriceChange,
  onBedroomChange,
  onSortDateChange,
  onSortPriceChange
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  if (!isAreaSelected) return null;

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={toggleFilter}
        className="md:hidden fixed bottom-16 right-3 z-50 bg-blue-600 text-white p-2.5 rounded-full shadow-lg flex items-center justify-center"
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* Mobile Filter Drawer */}
      <div className={`
        md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300
        ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <div className={`
          fixed inset-x-0 bottom-0 bg-white rounded-t-xl shadow-lg transform transition-transform duration-300
          ${isFilterOpen ? 'translate-y-0' : 'translate-y-full'}
        `}>
          <div className="flex justify-between items-center py-3 px-4 border-b">
            <h3 className="text-base font-semibold text-gray-900">Property Filters</h3>
            <button onClick={toggleFilter} className="text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-3 overflow-y-auto max-h-[70vh]">
            {renderFilterContent()}
          </div>
        </div>
      </div>

      {/* Desktop Filter */}
      <div className="hidden md:block bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Filters</h3>
        {renderFilterContent()}
      </div>
    </>
  );

  function renderFilterContent() {
    return (
      <div>
        {/* Sort by Date */}
        <div className="mb-4">
          <label className="block text-[10px] md:text-sm font-medium text-gray-700 mb-1.5">
            Sort by Date
          </label>
          <select
            value={sortDate}
            onChange={e => onSortDateChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8"
          >
            <option value="default">Default</option>
            <option value="newest">Newest to Oldest</option>
            <option value="oldest">Oldest to Newest</option>
          </select>
        </div>
        {/* Sort by Price */}
        <div className="mb-4">
          <label className="block text-[10px] md:text-sm font-medium text-gray-700 mb-1.5">
            Sort by Price
          </label>
          <select
            value={sortPrice}
            onChange={e => onSortPriceChange(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none pr-8"
          >
            <option value="default">Default</option>
            <option value="highToLow">Highest to Lowest</option>
            <option value="lowToHigh">Lowest to Highest</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <label className="block text-[10px] md:text-sm font-medium text-gray-700 mb-1.5">
            <DollarSign className="w-3 h-3 md:w-4 md:h-4 inline mr-0.5 md:mr-1" />
            Price Range (AED)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="text"
                placeholder="Min Price e.g. 2,500,000"
                value={minPrice}
                onChange={e => {
                  onPriceChange(e.target.value, maxPrice);
                }}
                className="w-full bg-white border border-gray-300 rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Max Price e.g. 5,000,000"
                value={maxPrice}
                onChange={e => {
                  onPriceChange(minPrice, e.target.value);
                }}
                className="w-full bg-white border border-gray-300 rounded px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Bedrooms */}
        <div className="mb-4">
          <label className="block text-[10px] md:text-sm font-medium text-gray-700 mb-1.5">
            <Home className="w-3 h-3 md:w-4 md:h-4 inline mr-0.5 md:mr-1" />
            Bedrooms
          </label>
          <div className="grid grid-cols-6 gap-1">
            {[1, 2, 3, 4, 5, '6+'].map((bed) => (
              <button
                key={bed}
                onClick={() => onBedroomChange(bed === '6+' ? 6 : (bedrooms === Number(bed) ? null : Number(bed)))}
                className={`
                  py-1.5 md:py-2 px-1 rounded text-[10px] md:text-sm font-medium transition-all duration-200
                  ${bedrooms === (bed === '6+' ? 6 : Number(bed))
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {bed}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        {(minPrice || maxPrice || bedrooms || sortDate !== 'default') && (
          <button
            onClick={() => {
              onPriceChange('', '');
              onBedroomChange(null);
              onSortDateChange('default');
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 md:py-2 px-3 md:px-4 rounded text-xs md:text-sm font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }
};
