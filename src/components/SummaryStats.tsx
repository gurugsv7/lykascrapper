import React from 'react';
import { AreaData } from '../types/Property';
import { Building, TrendingUp, Clock, MapPin } from 'lucide-react';

interface SummaryStatsProps {
  loadedAreas: { [key: string]: AreaData };
  totalAreas: number;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ loadedAreas, totalAreas }) => {
  const calculateStats = () => {
    const areaKeys = Object.keys(loadedAreas);
    const totalListings = areaKeys.reduce((sum, key) => sum + loadedAreas[key].totalListings, 0);
    
    const lastUpdated = areaKeys.length > 0 
      ? Math.max(...areaKeys.map(key => new Date(loadedAreas[key].lastUpdated).getTime()))
      : Date.now();

    const averagePrice = areaKeys.length > 0
      ? areaKeys.reduce((sum, key) => sum + loadedAreas[key].averagePrice, 0) / areaKeys.length
      : 0;

    return {
      totalListings,
      lastUpdated: new Date(lastUpdated).toLocaleDateString('en-AE'),
      averagePrice
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-blue-600">Total Areas</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900">{totalAreas}</p>
          </div>
          <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-green-600">Total Listings</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900">{stats.totalListings.toLocaleString()}</p>
          </div>
          <Building className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 sm:p-6 border border-yellow-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-yellow-600">Avg. Price</p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-900">
              {stats.averagePrice > 0 ? `${(stats.averagePrice / 1000000).toFixed(1)}M` : 'N/A'}
            </p>
          </div>
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-purple-600">Last Updated</p>
            <p className="text-sm sm:text-base lg:text-lg font-bold text-purple-900">{stats.lastUpdated}</p>
          </div>
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
        </div>
      </div>
    </div>
  );
};