import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardLayout } from '../../../components/DashboardLayout';

export const TicketDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ticketing Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name || 'Ticket Officer'}! Here's your daily overview.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600">Tickets Issued Today</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">427</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% from yesterday</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-600">Tickets Pending</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">187</p>
            <p className="text-xs text-yellow-600 mt-1">⚠️ Requires attention</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">3.2 <span className="text-lg">mins</span></p>
            <p className="text-xs text-blue-600 mt-1">↓ 0.5 mins improvement</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600">Success Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">94%</p>
            <p className="text-xs text-green-600 mt-1">↑ 2% from last week</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-gray-600">Issuance Failure</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">19</p>
            <p className="text-xs text-red-600 mt-1">↓ 3 from yesterday</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
            <p className="text-sm font-medium text-gray-600">Urgent PNR's</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">13</p>
            <p className="text-xs text-orange-600 mt-1">🚨 High priority</p>
          </div>
        </div>

        {/* PNR Management Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">PNR Management Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Failed</p>
                  <p className="text-2xl font-bold text-red-900">8</p>
                </div>
                <span className="text-3xl">❌</span>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pending Creation</p>
                  <p className="text-2xl font-bold text-yellow-900">23</p>
                </div>
                <span className="text-3xl">⏳</span>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Created & Confirmed</p>
                  <p className="text-2xl font-bold text-green-900">1,345</p>
                </div>
                <span className="text-3xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Processing Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Processing Trend (Today)</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Chart placeholder - Ticket processing over time</p>
          </div>
        </div>

        {/* Notification Panel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Panel</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-xl">ℹ️</span>
              <div>
                <p className="text-sm font-medium text-blue-900">System update scheduled</p>
                <p className="text-xs text-blue-600 mt-1">Tonight at 11:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-medium text-yellow-900">High volume warning</p>
                <p className="text-xs text-yellow-600 mt-1">Ticket requests increased by 25%</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-sm font-medium text-green-900">Daily target achieved</p>
                <p className="text-xs text-green-600 mt-1">500 tickets processed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
