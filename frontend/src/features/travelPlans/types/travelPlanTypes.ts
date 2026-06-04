export type TripType = 'MultiCity' | 'Return' | 'OneWay' | string;

export interface TravelPlanFlight {
  id: number;
  flightOrder: number;
  departureAirport: string;
  arrivalAirport: string;
  fromDate?: string | null;
}

export interface TravelPlan {
  id: number;
  tripName: string;
  tripType: TripType;
  cabinClass: string;
  preferredAirline?: string | null;
  adults: number;
  children: number;
  infants: number;
  fromDate: string;
  toDate: string;
  budgetType: string;
  currency: string;
  maxBudget: number;
  notes?: string | null;
  createdAt: string;
  flights: TravelPlanFlight[];
}

export interface CreateTravelPlanFlight {
  flightOrder: number;
  departureAirport: string;
  arrivalAirport: string;
  fromDate?: string | null;
}

export interface CreateTravelPlanRequest {
  tripName: string;
  tripType: TripType;
  cabinClass: string;
  preferredAirline?: string | null;
  adults: number;
  children: number;
  infants: number;
  fromDate: string;
  toDate: string;
  budgetType: string;
  currency: string;
  maxBudget: number;
  notes?: string | null;
  flights: CreateTravelPlanFlight[];
}
