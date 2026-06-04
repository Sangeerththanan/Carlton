import axios from 'axios';
import { API_ENDPOINTS } from '../../../config/apiConfig';

export type FlightSearchLegPayload = {
  from?: string;
  to?: string;
  departureDate?: string | null;
};

export type FlightSearchPayload = {
  deviceId: string;
  from?: string;
  to?: string;
  tripType: string;
  departureDate?: string | null;
  returnDate?: string | null;
  adults: number;
  children: number;
  infants: number;
  cabinClass?: string;
  airlines?: string;
  directOnly: boolean;
  legs?: FlightSearchLegPayload[];
};

export type HotelSearchPayload = {
  deviceId: string;
  destination?: string;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  adults: number;
  children: number;
  infants: number;
  roomsStandard: number;
  roomsDeluxe: number;
  roomsSuite: number;
  roomsFamily: number;
  mealPreferences?: string[];
};

export type FlightHotelSearchPayload = {
  deviceId: string;
  from?: string;
  to?: string;
  tripType: string;
  departureDate?: string | null;
  returnDate?: string | null;
  adults: number;
  children: number;
  infants: number;
  airlines?: string;
  mealPreferences?: string[];
  directOnly: boolean;
  legs?: FlightSearchLegPayload[];
};

export type CarSearchPayload = {
  deviceId: string;
  pickupLocation?: string;
  returnLocation?: string;
  pickupDate?: string | null;
  returnDate?: string | null;
  pickupTime?: string | null;
  returnTime?: string | null;
  differentReturn: boolean;
  driverAge30To65: boolean;
};

const api = axios.create({ withCredentials: true });

export const searchService = {
  logFlightSearch: async (payload: FlightSearchPayload) => {
    await api.post(`${API_ENDPOINTS.SEARCH}/flights`, payload);
  },
  logHotelSearch: async (payload: HotelSearchPayload) => {
    await api.post(`${API_ENDPOINTS.SEARCH}/hotels`, payload);
  },
  logFlightHotelSearch: async (payload: FlightHotelSearchPayload) => {
    await api.post(`${API_ENDPOINTS.SEARCH}/flight-hotels`, payload);
  },
  logCarSearch: async (payload: CarSearchPayload) => {
    await api.post(`${API_ENDPOINTS.SEARCH}/cars`, payload);
  },
};
