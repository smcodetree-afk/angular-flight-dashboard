export type FlightStatus = 'Active' | 'Delayed' | 'Arrived' | 'Scheduled';

export interface Airport {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  callsign: string;
  aircraftType: string;
  origin: Airport;
  destination: Airport;
  status: FlightStatus;
  currentPosition: {
    lat: number;
    lng: number;
    heading: number; // degrees, for marker rotation
  };
  estimatedDeparture: string; // ISO string
  estimatedArrival: string; // ISO string
  altitudeFt?: number;
  speedKts?: number;
}

export interface FlightFilters {
  search: string;
  status: FlightStatus | 'All';
  origin: string | 'All';
  destination: string | 'All';
}

export interface DashboardKpis {
  total: number;
  active: number;
  delayed: number;
  arrived: number;
}
