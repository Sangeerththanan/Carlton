import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardLayout } from '../../../components/DashboardLayout';

export const OperationsDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Operations Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name || 'Operations Manager'}! Monitor airport operations.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600">On Time</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">28</p>
            <p className="text-xs text-green-600 mt-1">Flights on schedule</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-600">Delayed</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">8</p>
            <p className="text-xs text-yellow-600 mt-1">Flights delayed</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600">Departed</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">42</p>
            <p className="text-xs text-blue-600 mt-1">Flights departed today</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-gray-600">Alerts</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
            <p className="text-xs text-red-600 mt-1">Active alerts</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-600">Gate Occupancy</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">78%</p>
            <p className="text-xs text-purple-600 mt-1">18/23 gates occupied</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-sm font-medium text-gray-600">Weather Status</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">Clear</p>
            <p className="text-xs text-green-600 mt-1">No weather delays</p>
          </div>
        </div>

        {/* Flight Status Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Flight Status Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                <span className="text-2xl">On Time</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">28</p>
              <p className="text-sm text-gray-600">Flights</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-3">
                <span className="text-2xl">Delayed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-600">Flights</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                <span className="text-2xl">Departed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">42</p>
              <p className="text-sm text-gray-600">Flights</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-3">
                <span className="text-2xl">Alerts</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </div>
        </div>

        {/* Today's Flight Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Flight Schedule</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">CA101</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LHR-JFK</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">08:30</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">A12</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      On Time
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">CA205</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">JFK-LAX</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">09:15</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">B05</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Delayed 15min
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">CA310</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LAX-ORD</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10:45</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">C22</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      On Time
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">CA425</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">ORD-BOS</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">11:30</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">D08</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Cancelled
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Airport Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Airport Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Weather Conditions</p>
                  <p className="text-lg font-bold text-blue-900">Clear</p>
                </div>
                <span className="text-3xl">Sunny</span>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Runway Status</p>
                  <p className="text-lg font-bold text-green-900">All Open</p>
                </div>
                <span className="text-3xl">Runway</span>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Security Level</p>
                  <p className="text-lg font-bold text-purple-900">Normal</p>
                </div>
                <span className="text-3xl">Shield</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
