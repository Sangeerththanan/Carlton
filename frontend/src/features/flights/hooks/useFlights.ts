import { useState, useEffect } from 'react';
import { flightService } from '../services/flightService';
import type { Flight } from '../types/flightTypes';

export const useFlights = () => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await flightService.getAllFlights();
      setFlights(data);
    } catch (err) {
      setError('Failed to fetch flights');
      console.error('Error fetching flights:', err);
    } finally {
      setLoading(false);
    }
  };

  const createFlight = async (flightData: any) => {
    try {
      const newFlight = await flightService.createFlight(flightData);
      setFlights(prev => [...prev, newFlight]);
      return newFlight;
    } catch (err) {
      console.error('Error creating flight:', err);
      throw err;
    }
  };

  const updateFlight = async (id: number, flightData: any) => {
    try {
      const updatedFlight = await flightService.updateFlight(id, flightData);
      setFlights(prev => prev.map(flight => 
        flight.id === id ? updatedFlight : flight
      ));
      return updatedFlight;
    } catch (err) {
      console.error('Error updating flight:', err);
      throw err;
    }
  };

  const deleteFlight = async (id: number) => {
    try {
      await flightService.deleteFlight(id);
      setFlights(prev => prev.filter(flight => flight.id !== id));
    } catch (err) {
      console.error('Error deleting flight:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  return {
    flights,
    loading,
    error,
    fetchFlights,
    createFlight,
    updateFlight,
    deleteFlight
  };
};
