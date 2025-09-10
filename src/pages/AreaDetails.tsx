import React from 'react';
import { useParams } from 'react-router-dom';

const AreaDetails = () => {
  const { areaName } = useParams<{ areaName: string }>();

  // Placeholder data for demonstration
  const areaData = {
    averages: {
      '1 Bedroom': 1000000,
      '2 Bedrooms': 1500000,
      '3 Bedrooms': 2000000,
    },
    totalListings: 120,
    lowestPrice: 800000,
    highestPrice: 2500000,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Details for {areaName}</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Averages by Bedroom Size</h2>
        <ul className="list-disc pl-5">
          {Object.entries(areaData.averages).map(([bedroom, avgPrice]) => (
            <li key={bedroom}>
              {bedroom}: AED {avgPrice.toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white shadow-md rounded-lg p-4 mt-4">
        <h2 className="text-xl font-semibold mb-3">Additional Details</h2>
        <p>Total Listings: {areaData.totalListings}</p>
        <p>Lowest Price: AED {areaData.lowestPrice.toLocaleString()}</p>
        <p>Highest Price: AED {areaData.highestPrice.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AreaDetails;