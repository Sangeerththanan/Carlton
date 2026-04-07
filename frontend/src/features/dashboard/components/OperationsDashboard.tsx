import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { LogOut, Plane, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export const OperationsDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Plane className="h-8 w-8 text-orange-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Carlton Airport Operations</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Operations Dashboard</h2>
          <p className="text-gray-600 mt-1">Monitor flight operations, gate management, and airport status</p>
        </div>

        {/* Flight Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <Plane className="h-6 w-6 text-green-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">On Time</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">28</p>
            <p className="text-sm text-green-600">Flights on schedule</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <Clock className="h-6 w-6 text-yellow-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Delayed</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">8</p>
            <p className="text-sm text-yellow-600">Flights delayed</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-6 w-6 text-blue-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Departed</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">42</p>
            <p className="text-sm text-blue-600">Flights departed today</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Alerts</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">3</p>
            <p className="text-sm text-red-600">Active alerts</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Flight Management</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                Update Flight Status
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                Gate Assignment
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                Schedule Changes
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Airport Status</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                Weather Conditions
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                Runway Status
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors">
                Security Updates
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors">
                Emergency Protocol
              </button>
              <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors">
                Contact Tower
              </button>
              <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors">
                Alert Broadcast
              </button>
            </div>
          </div>
        </div>

        {/* Flight Schedule */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Flight Schedule</h3>
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
      </main>
    </div>
  );
};
