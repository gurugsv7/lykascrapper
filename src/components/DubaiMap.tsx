import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AreaInfo } from '../types/Property';
import { Building2, Home, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DubaiMapProps {
  areas: AreaInfo[];
  selectedArea: string | null;
  onAreaSelect: (areaName: string) => void;
  areaStats: { [key: string]: { listings: number; lowestPrice: number } };
}

// Custom marker icons
const createCustomIcon = (category: 'villas' | 'apartments', isSelected: boolean) => {
  const color = isSelected ? '#F59E0B' : category === 'villas' ? '#10B981' : '#3B82F6';
  const size = isSelected ? 40 : 30;
  
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${size * 0.4}px;
        font-weight: bold;
      ">
        ${category === 'villas' ? '🏠' : '🏢'}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export const DubaiMap: React.FC<DubaiMapProps> = ({
  areas,
  selectedArea,
  onAreaSelect,
  areaStats
}) => {
  // Dubai center coordinates
  const dubaiCenter: [number, number] = [25.2048, 55.2708];

  return (
    <div className="relative h-96 rounded-xl overflow-hidden border border-gray-200 shadow-lg">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Dubai Areas</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Villas & Townhouses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Apartments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={dubaiCenter}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Satellite/Street view tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Alternative: Satellite view */}
        {/* <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        /> */}

        {/* Area Markers */}
        {areas.map((area) => {
          const stats = areaStats[area.name];
          const isSelected = selectedArea === area.name;
          
          return (
            <Marker
              key={area.name}
              position={[area.coordinates.lat, area.coordinates.lng]}
              icon={createCustomIcon(area.category, isSelected)}
              eventHandlers={{
                click: () => onAreaSelect(area.name),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    {area.category === 'villas' ? (
                      <Home className="w-4 h-4 text-green-600" />
                    ) : (
                      <Building2 className="w-4 h-4 text-blue-600" />
                    )}
                    <h4 className="font-semibold text-gray-900">{area.name}</h4>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {area.category === 'villas' ? 'Villas & Townhouses' : 'Apartments'}
                  </div>
                  
                  {stats ? (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Listings:</span>
                        <span className="font-medium">{stats.listings}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium text-green-600">
                          AED {stats.lowestPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Click to load data</div>
                  )}
                  
                  <button
                    onClick={() => onAreaSelect(area.name)}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition-colors"
                  >
                    View Properties
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};