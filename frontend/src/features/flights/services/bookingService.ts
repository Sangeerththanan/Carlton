import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import type {
  Booking,
  BookingQuote,
  BookingQuoteRequest,
  CreateBookingRequest,
  RefundOption,
  ServicePackageOption,
} from '../types/flightTypes';

const axiosInstance = axios.create({
  withCredentials: true, // Include cookies with requests
});

export const bookingService = {
  createBooking: async (payload: CreateBookingRequest): Promise<Booking> => {
    const response = await axiosInstance.post(API_ENDPOINTS.BOOKINGS, payload);

    return response.data;
  },

  createGuestBooking: async (payload: CreateBookingRequest): Promise<Booking> => {
    const response = await axiosInstance.post(API_ENDPOINTS.BOOKINGS_GUEST, payload);

    return response.data;
  },

  getMyBookings: async (): Promise<Booking[]> => {
    const response = await axiosInstance.get(API_ENDPOINTS.BOOKINGS);

    return response.data;
  },

  getBookingById: async (id: number): Promise<Booking> => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.BOOKINGS}/${id}`);

    return response.data;
  },

  getServicePackages: async (): Promise<ServicePackageOption[]> => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.BOOKINGS}/service-packages`);

    return response.data;
  },

  getRefundOptions: async (): Promise<RefundOption[]> => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.BOOKINGS}/refund-options`);

    return response.data;
  },

  getBookingQuote: async (payload: BookingQuoteRequest): Promise<BookingQuote> => {
    const response = await axiosInstance.post(`${API_ENDPOINTS.BOOKINGS}/quote`, payload);

    return response.data;
  },
};
