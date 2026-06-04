import axios from 'axios';
import type { Flight, CreateFlightRequest, UpdateFlightRequest } from '../types/flightTypes';
import { API_ENDPOINTS } from '../../../config/apiConfig';

const api = axios.create({ withCredentials: true });

export const flightService = {
  // Get all flights
  getAllFlights: async (): Promise<Flight[]> => {
    const response = await api.get(API_ENDPOINTS.FLIGHTS);
    return response.data;
  },

  // Get flight by ID
  getFlightById: async (id: number): Promise<Flight> => {
    const response = await api.get(`${API_ENDPOINTS.FLIGHTS}/${id}`);
    return response.data;
  },

  // Create new flight
  createFlight: async (flight: CreateFlightRequest): Promise<Flight> => {
    const response = await api.post(API_ENDPOINTS.FLIGHTS, flight);
    return response.data;
  },

  // Update flight
  updateFlight: async (id: number, flight: UpdateFlightRequest): Promise<Flight> => {
    const response = await api.put(`${API_ENDPOINTS.FLIGHTS}/${id}`, flight);
    return response.data;
  },

  // Delete flight
  deleteFlight: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.FLIGHTS}/${id}`);
  },

  // Check seat availability
  checkSeatAvailability: async (id: number, requiredSeats: number = 1): Promise<boolean> => {
    const response = await api.get(`${API_ENDPOINTS.FLIGHTS}/${id}/availability?requiredSeats=${requiredSeats}`);
    return response.data;
  }
};
