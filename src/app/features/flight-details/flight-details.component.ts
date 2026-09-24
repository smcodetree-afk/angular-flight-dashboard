import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Flight } from '../../core/models/flight.model';
import { FlightService } from '../../core/services/flight.service';

@Component({
  selector: 'app-flight-details',
  templateUrl: './flight-details.component.html',
  styleUrls: ['./flight-details.component.scss'],
})
export class FlightDetailsComponent {
  selectedFlight$: Observable<Flight | null> = this.flightService.selectedFlight$;

  constructor(private flightService: FlightService) {}

  close(): void {
    this.flightService.selectFlight(null);
  }

  formatTime(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
