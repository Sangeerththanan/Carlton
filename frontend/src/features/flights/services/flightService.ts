import axios from 'axios';
import type { Flight, CreateFlightRequest, UpdateFlightRequest } from '../types/flightTypes';

const API_BASE_URL = 'http://localhost:5271/api/flights';

export const flightService = {
  // Get all flights
  getAllFlights: async (): Promise<Flight[]> => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  // Get flight by ID
  getFlightById: async (id: number): Promise<Flight> => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // Create new flight
  createFlight: async (flight: CreateFlightRequest): Promise<Flight> => {
    const response = await axios.post(API_BASE_URL, flight);
    return response.data;
  },

  // Update flight
  updateFlight: async (id: number, flight: UpdateFlightRequest): Promise<Flight> => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, flight);
    return response.data;
  },

  // Delete flight
  deleteFlight: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${id}`);
  },

  // Check seat availability
  checkSeatAvailability: async (id: number, requiredSeats: number = 1): Promise<boolean> => {
    const response = await axios.get(`${API_BASE_URL}/${id}/availability?requiredSeats=${requiredSeats}`);
    return response.data;
  }
};
