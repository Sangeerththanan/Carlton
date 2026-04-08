import React from 'react';
import type { Provider } from '../types/providerTypes';

interface ProviderCardProps {
  provider: Provider;
  onEdit: (provider: Provider) => void;
  onDelete: (provider: Provider) => void;
  onStatusChange: (provider: Provider, status: 'active' | 'inactive' | 'pending') => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ 
  provider, 
  onEdit, 
  onDelete, 
  onStatusChange 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('star');
    }
    if (hasHalfStar) {
      stars.push('star-half');
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push('star-outline');
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
          <p className="text-sm text-gray-600">{provider.serviceType}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(provider.status)}`}>
          {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">Email:</span>
          <span className="text-gray-900">{provider.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">Phone:</span>
          <span className="text-gray-900">{provider.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">Location:</span>
          <span className="text-gray-900">{provider.city}, {provider.country}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="mr-2">Commission:</span>
          <span className="text-gray-900">{provider.commission}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="flex">
            {getRatingStars(provider.rating).map((star, index) => (
              <span key={index} className="text-yellow-400">
                {star === 'star' ? 'star' : star === 'star-half' ? 'star-half' : 'star-outline'}
              </span>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">({provider.rating})</span>
        </div>
        <div className="text-sm text-gray-600">
          {provider.totalBookings} bookings
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>Joined: {new Date(provider.joinedDate).toLocaleDateString()}</span>
        <span>Last active: {new Date(provider.lastActive).toLocaleDateString()}</span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(provider)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(provider)}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
        
        <select
          value={provider.status}
          onChange={(e) => onStatusChange(provider, e.target.value as 'active' | 'inactive' | 'pending')}
          className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>
    </div>
  );
};

export default ProviderCard;
