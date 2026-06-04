export interface Booking {
  id: number;
  bookingReference: string;
  customerId: number;
  customerName: string;
  flightId: number;
  flightNumber: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  totalPrice: number;
  seatsBooked: number;
  bookingDate: string;
  paymentStatus: string;
  specialRequests?: string;
  selectedServices?: string;
  passengerNames?: string;
  bookingClass?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  isPaid: boolean;
  refundAmount?: number;
  refundedAt?: string;
  // Check-in fields
  isCheckedIn?: boolean;
  seatNumber?: string;
  checkedInAt?: string;
}

export interface CreateBookingRequest {
  flightId: number;
  seatsBooked: number;
  bookingClass: string;
  specialRequests?: string;
  passengerNames: string;
}

export interface CancelBookingRequest {
  reason?: string;
}
