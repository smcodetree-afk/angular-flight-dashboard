import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardKpis } from '../../core/models/flight.model';
import { FlightService } from '../../core/services/flight.service';

interface KpiCardConfig {
  key: keyof DashboardKpis;
  label: string;
  icon: string;
  accent: string;
}

@Component({
  selector: 'app-kpi-cards',
  templateUrl: './kpi-cards.component.html',
  styleUrls: ['./kpi-cards.component.scss'],
})
export class KpiCardsComponent {
  kpis$: Observable<DashboardKpis> = this.flightService.kpis$;

  cards: KpiCardConfig[] = [
    { key: 'total', label: 'Total Flights', icon: '✈️', accent: 'total' },
    { key: 'active', label: 'Active Flights', icon: '🟢', accent: 'active' },
    { key: 'delayed', label: 'Delayed Flights', icon: '🟠', accent: 'delayed' },
    { key: 'arrived', label: 'Arrived Flights', icon: '🔵', accent: 'arrived' },
  ];

  constructor(private flightService: FlightService) {}
}
