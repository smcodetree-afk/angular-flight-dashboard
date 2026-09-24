import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from '../../core/services/flight.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  constructor(
    private flightService: FlightService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.flightService.loadFlights().subscribe(() => {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.flightService.selectFlight(id);
      }
    });

    // Keep the URL in sync with the selected flight so a route/link is shareable.
    this.flightService.selectedFlight$.subscribe((flight) => {
      const targetUrl = flight ? `/flight/${flight.id}` : '/';
      if (this.router.url !== targetUrl) {
        this.router.navigateByUrl(targetUrl, { replaceUrl: true });
      }
    });
  }
}
