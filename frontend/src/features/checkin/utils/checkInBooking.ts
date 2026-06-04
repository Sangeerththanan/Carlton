export interface CheckInBooking {
  pnr: string;
  lastName: string;
  passengerName: string;
  route: string;
  airline: string;
  flightNumber: string;
  departure: string;
  dateLabel: string;
  timeLabel: string;
  boardingTime: string;
  fromCode: string;
  toCode: string;
  fromCity: string;
  toCity: string;
  gate: string;
  sequence: string;
  cabinClass: string;
}

export interface CheckInState {
  booking: CheckInBooking;
  selectedSeat?: string;
}

export const demoCheckInBooking: CheckInBooking = {
  pnr: 'ABC123',
  lastName: 'Smith',
  passengerName: 'John Smith',
  route: 'London to Dubai',
  airline: 'British Airways',
  flightNumber: 'BA 107',
  departure: 'March 25, 2026 - 14:30',
  dateLabel: 'March 25, 2026',
  timeLabel: '14:30',
  boardingTime: '13:45',
  fromCode: 'LHR',
  toCode: 'DXB',
  fromCity: 'London',
  toCity: 'Dubai',
  gate: 'TBA',
  sequence: '001',
  cabinClass: 'Economy',
};

export const getCheckInBookingFromState = (state: unknown): CheckInBooking => {
  const maybeState = state as Partial<CheckInState> | null;
  return maybeState?.booking ?? demoCheckInBooking;
};
