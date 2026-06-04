import axios from 'axios';
import type { Provider, CreateProviderRequest, UpdateProviderRequest, ProviderFilters } from '../types/providerTypes';
import { API_ENDPOINTS } from '../../../config/apiConfig';

const api = axios.create({ withCredentials: true });

export const providerService = {
  // Get all providers
  getAllProviders: async (filters?: ProviderFilters): Promise<Provider[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.serviceType) params.append('serviceType', filters.serviceType);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`${API_ENDPOINTS.PROVIDERS}?${params}`);
    return response.data;
  },

  // Get provider by ID
  getProviderById: async (id: number): Promise<Provider> => {
    const response = await api.get(`${API_ENDPOINTS.PROVIDERS}/${id}`);
    return response.data;
  },

  // Create new provider
  createProvider: async (provider: CreateProviderRequest): Promise<Provider> => {
    const response = await api.post(API_ENDPOINTS.PROVIDERS, provider);
    return response.data;
  },

  // Update provider
  updateProvider: async (id: number, provider: UpdateProviderRequest): Promise<Provider> => {
    const response = await api.put(`${API_ENDPOINTS.PROVIDERS}/${id}`, provider);
    return response.data;
  },

  // Delete provider
  deleteProvider: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.PROVIDERS}/${id}`);
  },

  // Update provider status
  updateProviderStatus: async (id: number, status: 'active' | 'inactive' | 'pending'): Promise<Provider> => {
    const response = await api.patch(`${API_ENDPOINTS.PROVIDERS}/${id}/status`, { status });
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
    const response = await api.get(`${API_ENDPOINTS.PROVIDERS}/stats`);
    return response.data;
  }
};
