import axios from 'axios';
import type { Booking, CreateBookingRequest, CancelBookingRequest } from '../types/bookingTypes';
import { API_ENDPOINTS } from '../../../config/apiConfig';

const api = axios.create({
  withCredentials: true
});

export const bookingService = {
  // Get customer bookings
  getCustomerBookings: async (): Promise<Booking[]> => {
    const response = await api.get(API_ENDPOINTS.BOOKINGS);
    return response.data;
  },

  // Get booking by ID
  getBookingById: async (id: number): Promise<Booking> => {
    const response = await api.get(`${API_ENDPOINTS.BOOKINGS}/${id}`);
    return response.data;
  },

  // Create new booking
  createBooking: async (bookingData: CreateBookingRequest): Promise<Booking> => {
    const response = await api.post(API_ENDPOINTS.BOOKINGS, bookingData);
    return response.data;
  },

  // Cancel booking
  cancelBooking: async (id: number, cancelData: CancelBookingRequest): Promise<Booking> => {
    const response = await api.put(`${API_ENDPOINTS.BOOKINGS}/${id}/cancel`, cancelData);
    return response.data;
  },

  // Upgrade Seat
  upgradeSeat: async (id: number, newClass: string): Promise<Booking> => {
    const response = await api.put(`${API_ENDPOINTS.BOOKINGS}/${id}/upgrade`, { newClass });
    return response.data;
  },

  // Add Services
  addServices: async (id: number, services: string[]): Promise<Booking> => {
    const response = await api.put(`${API_ENDPOINTS.BOOKINGS}/${id}/add-services`, { services });
    return response.data;
  }
};
