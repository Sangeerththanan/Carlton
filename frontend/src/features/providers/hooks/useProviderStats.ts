import { useState, useEffect } from 'react';
import { providerService } from '../services/providerService';

export const useProviderStats = () => {
  const [stats, setStats] = useState<{
    totalProviders: number;
    activeProviders: number;
    pendingProviders: number;
    totalBookings: number;
    averageRating: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await providerService.getProviderStats();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch provider statistics');
      console.error('Error fetching provider stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
};
