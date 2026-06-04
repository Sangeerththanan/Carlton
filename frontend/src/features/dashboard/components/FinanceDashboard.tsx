import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardLayout } from '../../../components/DashboardLayout';

export const FinanceDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Finance Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name || 'Finance Officer'}! Monitor your financial operations.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">$24,580</p>
            <p className="text-xs text-green-600 mt-1">↑ 12% from yesterday</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">$687,420</p>
            <p className="text-xs text-blue-600 mt-1">↑ 8% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-600">Pending Transactions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">$45,230</p>
            <p className="text-xs text-purple-600 mt-1">23 transactions pending</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-sm font-medium text-gray-600">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">$128,450</p>
            <p className="text-xs text-red-600 mt-1">↓ 5% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <p className="text-sm font-medium text-gray-600">Net Profit</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">$558,970</p>
            <p className="text-xs text-green-600 mt-1">↑ 15% from last month</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
            <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">$18,750</p>
            <p className="text-xs text-indigo-600 mt-1">⚠️ 12 invoices overdue</p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Flight Bookings</span>
                <span className="font-medium">$18,420 (75%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Cargo Services</span>
                <span className="font-medium">$4,890 (20%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Airport Fees</span>
                <span className="font-medium">$1,270 (5%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-purple-600 h-3 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (This Month)</h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">Chart placeholder - Revenue over time</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">TXN001</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-04-07 14:30</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Flight Booking</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">+$1,250</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">TXN002</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-04-07 13:45</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Refund</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">-$450</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">TXN003</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-04-07 12:20</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Cargo Service</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">+$890</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
