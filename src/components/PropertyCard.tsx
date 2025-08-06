import React from 'react';
import { Property } from '../types/Property';
import { Bed, Ruler, Calendar, MapPin, ExternalLink, Building } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const formatDate = (dateString: string) => {
    try {
      // Handle the date format "19 July 2025"
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original if parsing fails
      }
      return date.toLocaleDateString('en-AE', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const extractBuildingName = (buildingUrl: string) => {
    try {
      const parts = buildingUrl.split('/');
      const buildingPart = parts[parts.length - 2] || parts[parts.length - 1];
      return buildingPart.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    } catch {
      return 'Building';
    }
  };

  return (
    <div className={`
      bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 w-full
      transform hover:-translate-y-1
    `}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <div className="mb-3">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold px-3 py-1 rounded-full mb-2">
             {property.property_type}
            </div>
           <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight line-clamp-2 mb-2">
             {property.location}
            </h3>
           <p className="text-xs sm:text-sm text-gray-600 leading-tight line-clamp-2">
             {property.title}
           </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {property.price}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Bed className="w-4 h-4 text-blue-500" />
            <span>{property.beds}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Ruler className="w-4 h-4 text-blue-500" />
            <span>{property.size}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>{formatDate(property.posted_date)}</span>
          </div>
          {property.price_per_sqft !== undefined && property.price_per_sqft !== null && property.price_per_sqft !== Infinity && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="text-blue-500"><path d="M4 20V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14M4 20h16M4 20v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1M8 10h8M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>
                {property.price_per_sqft.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} AED/sqft
              </span>
            </div>
          )}
        </div>

        {/* Building Info */}
        <div className="mb-3 sm:mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Building</div>
          <div className="text-xs sm:text-sm text-gray-600 mb-1">{extractBuildingName(property.building_url)}</div>
          <a
            href={property.building_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Building className="w-3 h-3" />
            View all in building
          </a>
        </div>

        {/* View on Bayut */}
        <a
          href={property.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 w-full justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 sm:py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm"
        >
          <span>View on Bayut</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};