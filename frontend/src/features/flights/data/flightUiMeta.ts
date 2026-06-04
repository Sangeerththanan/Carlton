import type { Flight } from '../types/flightTypes';

export type FlightUiMeta = {
  airline: string;
  stops: number;
  hasCheckInBaggage: boolean;
  hasHandLuggage: boolean;
};

/**
 * Thin UI shim that defaults the few optional Flight fields the backend may omit.
 * No business data lives here — keep this file UI-only.
 */
export const getFlightUiMeta = (flight: Flight): FlightUiMeta => ({
  airline: flight.airline ?? 'Unknown Airline',
  stops: flight.stops ?? 0,
  hasCheckInBaggage: flight.hasCheckInBaggage ?? false,
  hasHandLuggage: flight.hasHandLuggage ?? true,
});
