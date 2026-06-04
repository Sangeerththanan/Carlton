import React, { useState } from "react";
import { useProviders } from "../hooks/useProviders";
import { useProviderStats } from "../hooks/useProviderStats";
import { ProviderForm, ProviderCard } from "../components";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { useToast } from "../../../contexts/ToastContext";
import type {
  Provider,
  CreateProviderRequest,
  UpdateProviderRequest,
} from "../types/providerTypes";

export const ProviderList: React.FC = () => {
  const {
    providers,
    loading,
    error,
    createProvider,
    updateProvider,
    deleteProvider,
    updateProviderStatus,
  } = useProviders();
  const { stats } = useProviderStats();
  const { showSuccess, showError } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    serviceType: "",
    city: "",
    search: "",
  });

  const handleCreate = () => {
    setEditingProvider(null);
    setShowForm(true);
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setShowForm(true);
  };

  const handleDelete = async (provider: Provider) => {
    if (window.confirm(`Are you sure you want to delete ${provider.name}?`)) {
      try {
        await deleteProvider(provider.id);
        showSuccess("Provider deleted successfully");
      } catch (err) {
        showError("Failed to delete provider");
      }
    }
  };

  const handleStatusChange = async (
    provider: Provider,
    status: "active" | "inactive" | "pending",
  ) => {
    try {
      await updateProviderStatus(provider.id, status);
      showSuccess(`Provider status updated to ${status}`);
    } catch (err) {
      showError("Failed to update provider status");
    }
  };

  const handleFormSubmit = async (
    data: CreateProviderRequest | UpdateProviderRequest,
  ) => {
    try {
      if (editingProvider) {
        await updateProvider(editingProvider.id, data as UpdateProviderRequest);
        showSuccess("Provider updated successfully");
      } else {
        await createProvider(data as CreateProviderRequest);
        showSuccess("Provider created successfully");
      }
      setShowForm(false);
      setEditingProvider(null);
    } catch (err) {
      showError(
        editingProvider
          ? "Failed to update provider"
          : "Failed to create provider",
      );
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredProviders = providers.filter((provider) => {
    if (filters.status && provider.status !== filters.status) return false;
    if (filters.serviceType && provider.serviceType !== filters.serviceType)
      return false;
    if (filters.city && provider.city !== filters.city) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        provider.name.toLowerCase().includes(searchLower) ||
        provider.email.toLowerCase().includes(searchLower) ||
        provider.phone.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  if (loading && providers.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading providers...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
            <p className="text-gray-600 mt-1">
              Manage service providers and their information
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add Provider
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-600">
                Total Providers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProviders}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeProviders}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pendingProviders}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <p className="text-sm font-medium text-gray-600">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalBookings}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type
              </label>
              <select
                value={filters.serviceType}
                onChange={(e) =>
                  handleFilterChange("serviceType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Services</option>
                <option value="transportation">Transportation</option>
                <option value="accommodation">Accommodation</option>
                <option value="tours">Tours & Activities</option>
                <option value="dining">Dining & Restaurants</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="Filter by city"
                value={filters.city}
                onChange={(e) => handleFilterChange("city", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Provider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProviders.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No providers found</div>
            <p className="text-gray-400 mt-2">
              Try adjusting your filters or add a new provider
            </p>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingProvider ? "Edit Provider" : "Add New Provider"}
              </h2>
              <ProviderForm
                provider={editingProvider || undefined}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProvider(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
