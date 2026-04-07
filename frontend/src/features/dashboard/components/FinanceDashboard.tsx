import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { LogOut, DollarSign, TrendingUp, CreditCard, FileText } from 'lucide-react';

export const FinanceDashboard: React.FC = () => {
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
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Carlton Airport Finance</h1>
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
          <h2 className="text-2xl font-bold text-gray-900">Finance Dashboard</h2>
          <p className="text-gray-600 mt-1">Monitor revenue, expenses, and financial operations</p>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <DollarSign className="h-6 w-6 text-green-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Today's Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">$24,580</p>
            <p className="text-sm text-green-600">+12% from yesterday</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Monthly Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">$687,420</p>
            <p className="text-sm text-blue-600">+8% from last month</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <CreditCard className="h-6 w-6 text-purple-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Pending Transactions</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">$45,230</p>
            <p className="text-sm text-purple-600">23 transactions</p>
          </div>
        </div>

        {/* Financial Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-center">
                <FileText className="h-5 w-5 mr-3 text-gray-600" />
                Generate Financial Report
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-center">
                <CreditCard className="h-5 w-5 mr-3 text-gray-600" />
                Process Refunds
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors flex items-center">
                <DollarSign className="h-5 w-5 mr-3 text-gray-600" />
                Revenue Analysis
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Flight Bookings</span>
                  <span className="font-medium">$18,420</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Cargo Services</span>
                  <span className="font-medium">$4,890</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Airport Fees</span>
                  <span className="font-medium">$1,270</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
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
      </main>
    </div>
  );
};
