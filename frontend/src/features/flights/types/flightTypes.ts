export interface Flight {
  id: number;
  flightNumber: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsAvailable: number;
  airline?: string;
  stops?: number;
  hasCheckInBaggage?: boolean;
  hasHandLuggage?: boolean;
}

export type TripType = 'round-trip' | 'one-way' | 'multi-city';

export type SortMode = 'quickest' | 'cheapest' | 'best';

export type DayWindow = 'morning' | 'afternoon' | 'evening' | 'night';

export type FilterSection = 'stops' | 'price' | 'duration' | 'depart' | 'sort' | 'cabin' | 'airlines' | 'baggage';

export type Segment = {
  id: number;
  from: string;
  to: string;
  departing: string;
};

export type PassengerCounts = {
  adults: number;
  children: number;
  infants: number;
};

export type PassengerRateRule = {
  adultMultiplier: number;
  childMultiplier: number;
  infantMultiplier: number;
  label: string;
};

export type SavedTraveler = {
  id: string;
  firstName: string;
  lastName: string;
  relation: string;
  gender: 'Male' | 'Female' | 'Other';
  nationality: string;
  dob: string;
  passportNumber: string;
  passportExpiry: string;
  title: 'Mr' | 'Ms' | 'Mrs' | 'Mx';
};

export type PassengerForm = {
  travelerId: string | null;
  passengerType: 'adult' | 'child' | 'infant';
  title: string;
  givenName: string;
  lastName: string;
  gender: string;
  dob: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  mealPreference: string;
  seatPreference: string;
};

export type FareBreakdown = {
  adultCount: number;
  childCount: number;
  infantCount: number;
  adultSubtotal: number;
  childSubtotal: number;
  infantSubtotal: number;
  baseFare: number;
  taxes: number;
  fees: number;
  total: number;
};

export type BookingState = {
  booking?: Booking;
  quote?: BookingQuote;
  flight?: Flight;
  passengerForms?: PassengerForm[];
  selectedTravelerIds?: string[];
  cabinClass?: string;
  tripType?: TripType;
  returnDate?: string;
  passengerCount?: number;
  passengerRateRule?: PassengerRateRule;
  total?: number;
  taxes?: number;
  fees?: number;
  pointsEarned?: number;
  fareBreakdown?: FareBreakdown;
  selectedPackageId?: string;
  selectedPackageName?: string;
  packageChargePerPassenger?: number;
  packageChargeTotal?: number;
  selectedRefundId?: string;
  selectedRefundTitle?: string;
  refundChargePerPassenger?: number;
  refundChargeTotal?: number;
  baseFareTotal?: number;
};

export interface CreateFlightRequest {
  flightNumber: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsAvailable: number;
}

export interface UpdateFlightRequest {
  flightNumber: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsAvailable: number;
}

export interface CreateBookingRequest {
  flightId: number;
  seatsBooked: number;
  bookingClass: string;
  specialRequests?: string;
  passengerNames: string;
  passengerDetailsJson?: string;
  packageMetadataJson?: string;
  refundMetadataJson?: string;
  paymentMetadataJson?: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  isRoundTrip?: boolean;
  packageId?: string;
  refundId?: string;
}

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
  passengerNames?: string;
  passengerDetailsJson?: string;
  packageMetadataJson?: string;
  refundMetadataJson?: string;
  paymentMetadataJson?: string;
  bookingClass?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  isPaid: boolean;
  refundAmount?: number;
  refundedAt?: string;
}

export interface ServicePackageOption {
  id: string;
  name: string;
  pricePerPassenger: number;
  topChoice: boolean;
  features: string[];
}

export interface RefundOption {
  id: string;
  title: string;
  pricePerPassenger: number;
  recommended: boolean;
  bullets: string[];
}

export interface BookingQuoteRequest {
  flightId: number;
  adultCount: number;
  childCount: number;
  infantCount: number;
  isRoundTrip: boolean;
  cabinClass: string;
  packageId?: string;
  refundId?: string;
}

export interface BookingQuote {
  adultCount: number;
  childCount: number;
  infantCount: number;
  adultMultiplier: number;
  childMultiplier: number;
  infantMultiplier: number;
  passengerRateRuleLabel: string;
  adultSubtotal: number;
  childSubtotal: number;
  infantSubtotal: number;
  baseFare: number;
  taxes: number;
  fees: number;
  packageChargePerPassenger: number;
  packageChargeTotal: number;
  refundChargePerPassenger: number;
  refundChargeTotal: number;
  total: number;
  passengerCount: number;
  pointsEarned: number;
}
