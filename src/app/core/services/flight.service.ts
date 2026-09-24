import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { DashboardKpis, Flight, FlightFilters } from '../models/flight.model';

const DEFAULT_FILTERS: FlightFilters = {
  search: '',
  status: 'All',
  origin: 'All',
  destination: 'All',
};

@Injectable({ providedIn: 'root' })
export class FlightService {
  private flightsSubject = new BehaviorSubject<Flight[]>([]);
  private filtersSubject = new BehaviorSubject<FlightFilters>(DEFAULT_FILTERS);
  private selectedFlightIdSubject = new BehaviorSubject<string | null>(null);

  /** All flights, unfiltered. */
  readonly flights$: Observable<Flight[]> = this.flightsSubject.asObservable();

  /** Current filter state. */
  readonly filters$: Observable<FlightFilters> = this.filtersSubject.asObservable();

  /** Flights after search + filters are applied. */
  readonly filteredFlights$: Observable<Flight[]> = combineLatest([
    this.flights$,
    this.filters$,
  ]).pipe(
    map(([flights, filters]) => this.applyFilters(flights, filters)),
    shareReplay(1)
  );

  /** Currently selected flight (or null). */
  readonly selectedFlight$: Observable<Flight | null> = combineLatest([
    this.flights$,
    this.selectedFlightIdSubject.asObservable(),
  ]).pipe(
    map(([flights, id]) => flights.find((f) => f.id === id) ?? null),
    shareReplay(1)
  );

  /** Dashboard KPI counts, computed from the full flight list. */
  readonly kpis$: Observable<DashboardKpis> = this.flights$.pipe(
    map((flights) => ({
      total: flights.length,
      active: flights.filter((f) => f.status === 'Active').length,
      delayed: flights.filter((f) => f.status === 'Delayed').length,
      arrived: flights.filter((f) => f.status === 'Arrived').length,
    }))
  );

  private loaded = false;

  constructor(private http: HttpClient) {}

  /** Loads mock flight data once (idempotent). */
  loadFlights(): Observable<Flight[]> {
    if (this.loaded) {
      return this.flights$;
    }
    return this.http.get<Flight[]>('assets/data/mock-flights.json').pipe(
      tap((flights) => {
        this.flightsSubject.next(flights);
        this.loaded = true;
      }),
      switchMap(() => this.flights$)
    );
  }

  selectFlight(id: string | null): void {
    this.selectedFlightIdSubject.next(id);
  }

  updateFilters(partial: Partial<FlightFilters>): void {
    this.filtersSubject.next({ ...this.filtersSubject.value, ...partial });
  }

  resetFilters(): void {
    this.filtersSubject.next(DEFAULT_FILTERS);
  }

  get currentFlights(): Flight[] {
    return this.flightsSubject.value;
  }

  private applyFilters(flights: Flight[], filters: FlightFilters): Flight[] {
    const search = filters.search.trim().toLowerCase();
    return flights.filter((f) => {
      const matchesSearch =
        !search ||
        f.callsign.toLowerCase().includes(search) ||
        f.flightNumber.toLowerCase().includes(search);
      const matchesStatus = filters.status === 'All' || f.status === filters.status;
      const matchesOrigin = filters.origin === 'All' || f.origin.code === filters.origin;
      const matchesDestination =
        filters.destination === 'All' || f.destination.code === filters.destination;
      return matchesSearch && matchesStatus && matchesOrigin && matchesDestination;
    });
  }
}
