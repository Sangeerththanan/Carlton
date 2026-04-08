import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardLayout } from '../../../components/DashboardLayout';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                <p className="text-xs text-blue-600 mt-1">All time</p>
              </div>
              <div className="text-2xl text-blue-500 opacity-20">📋</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Flights</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
                <p className="text-xs text-green-600 mt-1">Next 30 days</p>
              </div>
              <div className="text-2xl text-green-500 opacity-20">✈️</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">150</p>
                <p className="text-xs text-purple-600 mt-1">Available</p>
              </div>
              <div className="text-2xl text-purple-500 opacity-20">⭐</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">$2,450</p>
                <p className="text-xs text-orange-600 mt-1">This year</p>
              </div>
              <div className="text-2xl text-orange-500 opacity-20">💰</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="text-2xl mb-2">🛫</div>
              <h3 className="font-medium text-gray-900 mb-1">Book Flight</h3>
              <p className="text-sm text-gray-600">Search and book new flights</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="text-2xl mb-2">📄</div>
              <h3 className="font-medium text-gray-900 mb-1">My Bookings</h3>
              <p className="text-sm text-gray-600">View and manage your bookings</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-medium text-gray-900 mb-1">Profile</h3>
              <p className="text-sm text-gray-600">Update your personal information</p>
            </button>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Ref</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">CA12345678</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">CA101</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">LHR-JFK</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2024-04-15</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">CA87654321</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">CA205</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">JFK-LAX</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2024-04-20</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">CA11223344</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">CA310</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">LAX-ORD</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">2024-03-28</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Completed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Destinations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🗽</div>
              <h3 className="font-medium text-gray-900 mb-1">New York</h3>
              <p className="text-sm text-gray-600 mb-2">JFK Airport</p>
              <p className="font-bold text-blue-600">From $450</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🎡</div>
              <h3 className="font-medium text-gray-900 mb-1">London</h3>
              <p className="text-sm text-gray-600 mb-2">LHR Airport</p>
              <p className="font-bold text-blue-600">From $380</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🌴</div>
              <h3 className="font-medium text-gray-900 mb-1">Los Angeles</h3>
              <p className="text-sm text-gray-600 mb-2">LAX Airport</p>
              <p className="font-bold text-blue-600">From $320</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-3xl mb-2">🏙</div>
              <h3 className="font-medium text-gray-900 mb-1">Chicago</h3>
              <p className="text-sm text-gray-600 mb-2">ORD Airport</p>
              <p className="font-bold text-blue-600">From $280</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
