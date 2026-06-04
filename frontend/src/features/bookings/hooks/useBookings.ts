import { useState, useCallback, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import type { Booking, CreateBookingRequest } from '../types/bookingTypes';

export const useBookings = (autoFetch = false) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getCustomerBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookingById = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getBookingById(id);
      setCurrentBooking(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch booking details');
      console.error('Error fetching booking details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: CreateBookingRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newBooking = await bookingService.createBooking(bookingData);
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create booking';
      setError(msg);
      console.error('Error creating booking:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: number, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedBooking = await bookingService.cancelBooking(id, { reason });
      setBookings(prev => prev.map(b => (b.id === id ? updatedBooking : b)));
      if (currentBooking && currentBooking.id === id) {
        setCurrentBooking(updatedBooking);
      }
      return updatedBooking;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to cancel booking';
      setError(msg);
      console.error('Error cancelling booking:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const upgradeSeat = async (id: number, newClass: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedBooking = await bookingService.upgradeSeat(id, newClass);
      setBookings(prev => prev.map(b => (b.id === id ? updatedBooking : b)));
      if (currentBooking && currentBooking.id === id) {
        setCurrentBooking(updatedBooking);
      }
      return updatedBooking;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to upgrade seat';
      setError(msg);
      console.error('Error upgrading seat:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addServices = async (id: number, services: string[]) => {
    try {
      setLoading(true);
      setError(null);
      const updatedBooking = await bookingService.addServices(id, services);
      setBookings(prev => prev.map(b => (b.id === id ? updatedBooking : b)));
      if (currentBooking && currentBooking.id === id) {
        setCurrentBooking(updatedBooking);
      }
      return updatedBooking;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to add services';
      setError(msg);
      console.error('Error adding services:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchBookings();
    }
  }, [autoFetch, fetchBookings]);

  return {
    bookings,
    currentBooking,
    loading,
    error,
    fetchBookings,
    getBookingById,
    createBooking,
    cancelBooking,
    upgradeSeat,
    addServices
  };
};
