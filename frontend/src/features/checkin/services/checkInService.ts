import { API_ENDPOINTS } from '../../../config/apiConfig';

export interface CheckInBookingDto {
  id: number;
  bookingReference: string;
  passengerName: string;
  flightNumber: string;
  departure: string;
  destination: string;
  departureTime: string;
  bookingClass?: string;
  isCheckedIn: boolean;
  seatNumber?: string;
  checkedInAt?: string;
  status: string;
  isEligibleForCheckIn: boolean;
  checkInWindowMessage: string;
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message ?? 'Request failed');
  }

  return response.json() as Promise<T>;
}

export const checkInService = {
  /**
   * Look up a booking by booking reference (PNR) and passenger last name.
   */
  async lookupBooking(bookingReference: string, lastName: string): Promise<CheckInBookingDto> {
    return apiFetch<CheckInBookingDto>(API_ENDPOINTS.CHECKIN.LOOKUP, {
      method: 'POST',
      body: JSON.stringify({ bookingReference, lastName }),
    });
  },

  /**
   * Get all upcoming flights (within 7 days) for the authenticated customer.
   */
  async getUpcomingBookings(): Promise<CheckInBookingDto[]> {
    return apiFetch<CheckInBookingDto[]>(API_ENDPOINTS.CHECKIN.UPCOMING);
  },

  /**
   * Submit check-in, optionally saving the selected seat number.
   */
  async submitCheckIn(bookingId: number, seatNumber?: string): Promise<CheckInBookingDto> {
    return apiFetch<CheckInBookingDto>(API_ENDPOINTS.CHECKIN.SUBMIT, {
      method: 'POST',
      body: JSON.stringify({ bookingId, seatNumber }),
    });
  },
};
