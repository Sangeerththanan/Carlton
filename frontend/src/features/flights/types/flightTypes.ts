export interface Flight {
  id: number;
  flightNumber: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatsAvailable: number;
}

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
