import { useState, useEffect } from 'react';
import { providerService } from '../services/providerService';
import type { Provider, CreateProviderRequest, UpdateProviderRequest, ProviderFilters } from '../types/providerTypes';

export const useProviders = (filters?: ProviderFilters) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await providerService.getAllProviders(filters);
      setProviders(data);
    } catch (err) {
      setError('Failed to fetch providers');
      console.error('Error fetching providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProvider = async (providerData: CreateProviderRequest) => {
    try {
      const newProvider = await providerService.createProvider(providerData);
      setProviders(prev => [...prev, newProvider]);
      return newProvider;
    } catch (err) {
      console.error('Error creating provider:', err);
      throw err;
    }
  };

  const updateProvider = async (id: number, providerData: UpdateProviderRequest) => {
    try {
      const updatedProvider = await providerService.updateProvider(id, providerData);
      setProviders(prev => prev.map(provider => 
        provider.id === id ? updatedProvider : provider
      ));
      return updatedProvider;
    } catch (err) {
      console.error('Error updating provider:', err);
      throw err;
    }
  };

  const deleteProvider = async (id: number) => {
    try {
      await providerService.deleteProvider(id);
      setProviders(prev => prev.filter(provider => provider.id !== id));
    } catch (err) {
      console.error('Error deleting provider:', err);
      throw err;
    }
  };

  const updateProviderStatus = async (id: number, status: 'active' | 'inactive' | 'pending') => {
    try {
      const updatedProvider = await providerService.updateProviderStatus(id, status);
      setProviders(prev => prev.map(provider => 
        provider.id === id ? updatedProvider : provider
      ));
      return updatedProvider;
    } catch (err) {
      console.error('Error updating provider status:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  return {
    providers,
    loading,
    error,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    updateProviderStatus
  };
};
