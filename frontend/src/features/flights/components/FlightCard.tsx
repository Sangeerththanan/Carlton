import React from 'react';
import type { Flight } from '../types/flight.types';

interface FlightCardProps {
  flight: Flight;
  onEdit: (flight: Flight) => void;
  onDelete: (id: number) => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{flight.flightNumber}</h3>
          <div className="text-sm text-gray-600">
            {flight.departure} → {flight.destination}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">${flight.price}</div>
          <div className="text-sm text-gray-500">{flight.seatsAvailable} seats</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Departure</div>
          <div className="font-medium">{formatDate(flight.departureTime)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Arrival</div>
          <div className="font-medium">{formatDate(flight.arrivalTime)}</div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onEdit(flight)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(flight.id)}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default FlightCard;
