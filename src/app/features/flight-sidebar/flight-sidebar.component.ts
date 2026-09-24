import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Flight, FlightStatus } from '../../core/models/flight.model';
import { FlightService } from '../../core/services/flight.service';

@Component({
  selector: 'app-flight-sidebar',
  templateUrl: './flight-sidebar.component.html',
  styleUrls: ['./flight-sidebar.component.scss'],
})
export class FlightSidebarComponent implements OnInit, OnDestroy {
  filteredFlights$: Observable<Flight[]> = this.flightService.filteredFlights$;
  selectedFlight$: Observable<Flight | null> = this.flightService.selectedFlight$;

  statuses: (FlightStatus | 'All')[] = ['All', 'Active', 'Delayed', 'Arrived', 'Scheduled'];
  originOptions: string[] = [];
  destinationOptions: string[] = [];

  filterForm = this.fb.group({
    search: [''],
    status: ['All'],
    origin: ['All'],
    destination: ['All'],
  });

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private flightService: FlightService) {}

  ngOnInit(): void {
    this.flightService.flights$.pipe(takeUntil(this.destroy$)).subscribe((flights) => {
      this.originOptions = this.uniqueSorted(flights.map((f) => f.origin.code));
      this.destinationOptions = this.uniqueSorted(flights.map((f) => f.destination.code));
    });

    this.filterForm.valueChanges
      .pipe(debounceTime(150), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)), takeUntil(this.destroy$))
      .subscribe((value) => {
        this.flightService.updateFilters({
          search: value.search ?? '',
          status: (value.status as FlightStatus | 'All') ?? 'All',
          origin: value.origin ?? 'All',
          destination: value.destination ?? 'All',
        });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectFlight(flight: Flight): void {
    this.flightService.selectFlight(flight.id);
  }

  clearFilters(): void {
    this.filterForm.reset({ search: '', status: 'All', origin: 'All', destination: 'All' });
  }

  trackByFlightId(_index: number, flight: Flight): string {
    return flight.id;
  }

  private uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values)).sort();
  }
}
