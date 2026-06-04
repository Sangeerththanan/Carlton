import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Booking } from '../types/flightTypes';
import { bookingService } from '../services/bookingService';
import { getErrorMessage } from '../utils';
import { useToast } from '../../../contexts/ToastContext';

const formatCurrency = (value: number) => `£${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MyBookings = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const hasBookings = bookings.length > 0;

  useEffect(() => {
    const loadBookings = async () => {
      setIsLoading(true);

      try {
        const response = await bookingService.getMyBookings();
        setBookings(response);

        if (response.length > 0) {
          setSelectedBookingId(response[0].id);
        }
      } catch (errorValue) {
        showError(getErrorMessage(errorValue));
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [showError]);

  useEffect(() => {
    if (selectedBookingId == null) {
      setSelectedBooking(null);
      return;
    }

    const loadBookingById = async () => {
      setIsLoadingDetails(true);

      try {
        const response = await bookingService.getBookingById(selectedBookingId);
        setSelectedBooking(response);
      } catch (errorValue) {
        showError(getErrorMessage(errorValue));
      } finally {
        setIsLoadingDetails(false);
      }
    };

    loadBookingById();
  }, [selectedBookingId, showError]);

  const passengerNames = useMemo(() => {
    if (!selectedBooking?.passengerNames) {
      return [];
    }

    return selectedBooking.passengerNames
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }, [selectedBooking?.passengerNames]);

  return (
    <section className="space-y-4 px-1 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#D6E0F4] bg-white text-[#1E3A8A] hover:bg-[#F3F6FD]"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#1E3A8A]">My Bookings</h1>
          <p className="text-sm text-[#607BB1]">View your booking history and details</p>
        </div>
      </div>

      {isLoading ? (
        <section className="rounded-2xl border border-[#E1E8F7] bg-white p-6 text-sm font-semibold text-[#4B66A1]">
          Loading your bookings...
        </section>
      ) : !hasBookings ? (
        <section className="rounded-2xl border border-[#E1E8F7] bg-white p-6 text-center">
          <p className="text-sm font-semibold text-[#4B66A1]">You have no bookings yet.</p>
          <button
            onClick={() => navigate('/flight-search-customer')}
            className="mt-4 rounded-xl bg-[#1E3A8A] px-4 py-2 text-sm font-semibold text-white"
          >
            Search Flights
          </button>
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
          <section className="max-h-[32rem] space-y-3 overflow-y-auto rounded-2xl border border-[#E1E8F7] bg-white p-3">
            <p className="px-1 text-xs font-bold uppercase tracking-[0.16em] text-[#4B66A1]">All Bookings</p>
            {bookings.map((booking) => {
              const isSelected = booking.id === selectedBookingId;
              return (
                <button
                  key={booking.id}
                  onClick={() => setSelectedBookingId(booking.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    isSelected ? 'border-[#8EA5D9] bg-[#F1F5FE]' : 'border-[#E3EAF8] bg-white hover:bg-[#FAFCFF]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-[#1E3A8A]">{booking.bookingReference}</p>
                    <span className="rounded-full bg-[#EEF3FD] px-2 py-0.5 text-[10px] font-bold uppercase text-[#1E3A8A]">
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6D84B3]">{booking.departure} → {booking.destination}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(booking.departureTime)}</p>
                  <p className="mt-2 text-sm font-semibold text-[#2F4E97]">{formatCurrency(booking.totalPrice)}</p>
                </button>
              );
            })}
          </section>

          <section className="rounded-3xl border-0 bg-white p-6 shadow-sm ring-1 ring-gray-100">
            {isLoadingDetails || !selectedBooking ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-sm font-semibold text-[#4B66A1]">Loading booking details...</p>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl bg-white">
                {/* Header Section (Status & Reference) */}
                <div className="flex items-center justify-between bg-gradient-to-r from-[#1C398E] to-[#2F4E97] px-6 py-4 text-white">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-[#A5BBF5]">Booking Ref</p>
                    <h2 className="text-xl font-bold tracking-wide">{selectedBooking.bookingReference}</h2>
                  </div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase backdrop-blur-md">
                    {selectedBooking.status}
                  </span>
                </div>

                {/* Main Flight Info */}
                <div className="px-6 py-8">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-4xl font-black text-[#1C398E]">{selectedBooking.departure}</p>
                      <p className="mt-1 text-xs font-medium text-gray-500">{formatDateTime(selectedBooking.departureTime)}</p>
                    </div>

                    <div className="flex flex-1 flex-col items-center px-4">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {selectedBooking.flightNumber}
                      </p>
                      <div className="relative flex w-full items-center justify-center">
                        <div className="absolute left-0 right-0 h-[2px] bg-gray-200" />
                        <div className="z-10 bg-white px-2 text-[#1C398E]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-90 transform">
                            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 3.5L7 15l-3.3-.8c-.4-.1-.8.2-1 .6L2 16l4 2 2 4 .9-.4c.3-.4.6-.8.4-1.2L8.5 17l3.5-2 8.2 1.8c.4.1.8-.2.9-.6Z"/>
                          </svg>
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {selectedBooking.bookingClass || 'Economy'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-4xl font-black text-[#1C398E]">{selectedBooking.destination}</p>
                      <p className="mt-1 text-xs font-medium text-gray-500">{formatDateTime(selectedBooking.arrivalTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center px-6">
                  <div className="absolute -left-2 h-4 w-4 rounded-full bg-gray-50 shadow-inner" />
                  <div className="h-px w-full border-t-2 border-dashed border-gray-200" />
                  <div className="absolute -right-2 h-4 w-4 rounded-full bg-gray-50 shadow-inner" />
                </div>

                {/* Details Section */}
                <div className="bg-gray-50 px-6 py-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Passenger(s)</p>
                      <div className="mt-1">
                        {passengerNames.length === 0 ? (
                          <p className="text-sm font-semibold text-[#1C398E]">Not Available</p>
                        ) : (
                          passengerNames.map((name) => (
                            <p key={name} className="text-sm font-semibold text-[#1C398E]">{name}</p>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Seats</p>
                      <p className="mt-1 text-sm font-semibold text-[#1C398E]">{selectedBooking.seatsBooked}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Price</p>
                      <p className="mt-1 text-sm font-bold text-[#1C398E]">{formatCurrency(selectedBooking.totalPrice)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                    <p className="text-[10px] text-gray-400">
                      Booked on {formatDateTime(selectedBooking.bookingDate)}
                    </p>
                    <button className="rounded-lg bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#152a6b]">
                      Manage Booking
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
};

export default MyBookings;
