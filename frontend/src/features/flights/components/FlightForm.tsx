import React, { useState } from 'react';
import type { Flight, CreateFlightRequest } from '../types/flight.types';

interface FlightFormProps {
  flight?: Flight;
  onSubmit: (flight: CreateFlightRequest) => void;
  onCancel: () => void;
}

const FlightForm: React.FC<FlightFormProps> = ({ flight, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateFlightRequest>({
    flightNumber: flight?.flightNumber || '',
    departure: flight?.departure || '',
    destination: flight?.destination || '',
    departureTime: flight?.departureTime || '',
    arrivalTime: flight?.arrivalTime || '',
    price: flight?.price || 0,
    seatsAvailable: flight?.seatsAvailable || 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'seatsAvailable' 
        ? Number(value) 
        : value
    }));
  };

  const handleDateTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.blur();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Number
            </label>
            <input
              type="text"
              name="flightNumber"
              value={formData.flightNumber}
              onChange={handleChange}
              required
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure
            </label>
            <input
              type="text"
              name="departure"
              value={formData.departure}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arrival Time
            </label>
            <input
              type="datetime-local"
              name="arrivalTime"
              value={formData.arrivalTime.slice(0, 16)}
              onChange={handleChange}
              onBlur={handleDateTimeBlur}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Time
            </label>
            <input
              type="datetime-local"
              name="departureTime"
              value={formData.departureTime.slice(0, 16)}
              onChange={handleChange}
              onBlur={handleDateTimeBlur}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seats Available
            </label>
            <input
              type="number"
              name="seatsAvailable"
              value={formData.seatsAvailable}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {flight ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
  );
};

export default FlightForm;
