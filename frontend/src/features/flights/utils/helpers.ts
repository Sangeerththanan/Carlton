import type { Flight, Segment } from '../types/flightTypes';

export const toDateInput = (date: Date) => date.toISOString().slice(0, 10);

export const addDays = (dateValue: string, days: number) => {
  const baseDate = dateValue ? new Date(dateValue) : new Date();
  baseDate.setDate(baseDate.getDate() + days);
  return toDateInput(baseDate);
};

export const createSegment = (id: number, segment?: Partial<Segment>): Segment => ({
  id,
  from: segment?.from ?? '',
  to: segment?.to ?? '',
  departing: segment?.departing ?? toDateInput(new Date()),
});

export const getFlightWindow = (dateValue: string) => {
  const hour = new Date(dateValue).getHours();
  if (hour >= 5 && hour < 12) return 'morning' as const;
  if (hour >= 12 && hour < 17) return 'afternoon' as const;
  if (hour >= 17 && hour < 21) return 'evening' as const;
  return 'night' as const;
};

export const getDurationMinutes = (flight: Flight) => {
  const departureTime = new Date(flight.departureTime).getTime();
  const arrivalTime = new Date(flight.arrivalTime).getTime();
  return Math.max(0, Math.floor((arrivalTime - departureTime) / 60000));
};

export const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.trim().charAt(0) ?? '';
  const last = lastName?.trim().charAt(0) ?? '';
  const value = `${first}${last}`.toUpperCase();
  return value || 'NA';
};

export const toTitleCase = (value: string) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

export const getOrCreateReservationEndAt = (key: string, durationSeconds: number) => {
  if (typeof window === 'undefined') {
    return Date.now() + (durationSeconds * 1000);
  }

  const storageKey = `${key}:endAt`;
  const existingValue = Number(window.localStorage.getItem(storageKey));

  if (Number.isFinite(existingValue) && existingValue > 0) {
    return existingValue;
  }

  const endAt = Date.now() + (durationSeconds * 1000);
  window.localStorage.setItem(storageKey, String(endAt));
  return endAt;
};

const IATA_CODE_REGEX = /\b([A-Z]{3})\b/;
const AIRPORT_STOP_WORDS = new Set(['airport', 'international', 'intl', 'the', 'and', 'of']);

export const extractIataCode = (value: string): string | null => {
  const match = value.toUpperCase().match(IATA_CODE_REGEX);
  return match ? match[1] : null;
};

const tokenizeAirportName = (value: string): string[] =>
  value
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2 && !AIRPORT_STOP_WORDS.has(token));

/**
 * Lenient match between a user-typed airport label (e.g. "London Heathrow Airport (LHR)" or "lon")
 * and a flight's stored value (e.g. "London Heathrow (LHR)"). Compares IATA codes first, then
 * falls back to shared significant words so partial typing still surfaces relevant flights.
 */
export const matchesAirportField = (input: string, fieldValue: string): boolean => {
  const trimmed = input.trim();
  if (!trimmed) return true;

  const inputIata = extractIataCode(trimmed);
  const fieldIata = extractIataCode(fieldValue);
  if (inputIata && fieldIata) return inputIata === fieldIata;
  if (inputIata && fieldValue.toUpperCase().includes(inputIata)) return true;

  const inputTokens = tokenizeAirportName(trimmed);
  const fieldLower = fieldValue.toLowerCase();
  if (inputTokens.length === 0) {
    return fieldLower.includes(trimmed.toLowerCase());
  }
  return inputTokens.some((token) => fieldLower.includes(token));
};

export const getErrorMessage = (errorValue: unknown): string => {
  const axiosError = errorValue as any;
  if (axiosError?.response?.data) {
    const data = axiosError.response.data;
    if (typeof data === 'string') return data;
    if (data.message) return data.message;
    if (data.title) return data.title;
    if (data.detail) return data.detail;
    if (data.errors) {
      const firstError = Object.values(data.errors)[0];
      if (Array.isArray(firstError)) return String(firstError[0]);
      if (typeof firstError === 'string') return firstError;
    }
  }

  if (errorValue && typeof errorValue === 'object' && 'message' in errorValue && typeof (errorValue as any).message === 'string') {
    return (errorValue as any).message;
  }

  return 'An unexpected error occurred. Please try again.';
};
