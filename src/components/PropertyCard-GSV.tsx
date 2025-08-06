import React, { useState, useEffect } from 'react';
import { Property } from '../types/Property';
import { Bed, Ruler, Calendar, MapPin, ExternalLink, Building, Tag } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  areaCategory?: 'villas' | 'townhouses' | 'apartments';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, areaCategory }) => {
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    const viewedLinks = JSON.parse(localStorage.getItem('viewedBayutLinks') || '[]');
    setViewed(viewedLinks.includes(property.link));
  }, [property.link]);

  const handleBayutClick = () => {
    const viewedLinks = JSON.parse(localStorage.getItem('viewedBayutLinks') || '[]');
    if (!viewedLinks.includes(property.link)) {
      viewedLinks.push(property.link);
      localStorage.setItem('viewedBayutLinks', JSON.stringify(viewedLinks));
      setViewed(true);
    }
  };

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
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold px-3 py-1 rounded-full">
                {property.property_type && property.property_type.trim()
                  ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1).toLowerCase()
                  : areaCategory === 'villas'
                    ? 'Villa'
                    : areaCategory === 'townhouses'
                      ? 'Townhouse'
                      : ''
                }
              </div>
              {viewed && (
                <div className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full border border-yellow-600 shadow ml-1 animate-pulse">
                  Viewed
                </div>
              )}
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight line-clamp-2 mb-2">
            {property.location}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-tight line-clamp-2">
            {property.title}
          </p>
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
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <Tag className="w-4 h-4 text-blue-500" />
            <span>Price/sq.ft: AED {property.price_per_sqft ?? 0}</span>
          </div>
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
          onClick={handleBayutClick}
        >
          <span>View on Bayut</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};