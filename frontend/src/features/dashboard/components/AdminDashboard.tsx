import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { DashboardLayout } from '../../../components/DashboardLayout';
import { Users, Plane, DollarSign, Settings, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Flights',
      value: '1,234',
      icon: Plane,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Users',
      value: '5,678',
      icon: Users,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'System Alerts',
      value: '3',
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '-2',
      changeType: 'negative'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Admin'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your travel management system today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">from last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Plane className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Add New Flight</span>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Manage Users</span>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Settings className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">System Settings</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New flight added to system</p>
                <p className="text-xs text-gray-500">Flight CA-1234 - 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">User registration completed</p>
                <p className="text-xs text-gray-500">John Doe - 5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">System backup completed</p>
                <p className="text-xs text-gray-500">Daily backup - 1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
