import axios from 'axios';
import type { Provider, CreateProviderRequest, UpdateProviderRequest, ProviderFilters } from '../types/providerTypes';

const API_BASE_URL = 'http://localhost:5271/api/providers';

export const providerService = {
  // Get all providers
  getAllProviders: async (filters?: ProviderFilters): Promise<Provider[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.search) params.append('search', filters.search);

    const response = await axios.get(`${API_BASE_URL}?${params}`);
    return response.data;
  },

  // Get provider by ID
  getProviderById: async (id: number): Promise<Provider> => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Create new provider
  createProvider: async (provider: CreateProviderRequest): Promise<Provider> => {
    const response = await axios.post(API_BASE_URL, provider);
    return response.data;
  },

  // Update provider
  updateProvider: async (id: number, provider: UpdateProviderRequest): Promise<Provider> => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, provider);
    return response.data;
  },

  // Delete provider
  deleteProvider: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Update provider status
  updateProviderStatus: async (id: number, status: 'active' | 'inactive' | 'pending'): Promise<Provider> => {
    const response = await axios.patch(`${API_BASE_URL}/${id}/status`, { status });
    return response.data;
  },

  // Get provider statistics
  getProviderStats: async (): Promise<{
    totalProviders: number;
    activeProviders: number;
    pendingProviders: number;
    totalBookings: number;
    averageRating: number;
  }> => {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data;
  }
};
