import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Flight } from '../../core/models/flight.model';
import { FlightService } from '../../core/services/flight.service';

const STATUS_COLOR: Record<Flight['status'], string> = {
  Active: '#34d399',
  Delayed: '#f5a623',
  Arrived: '#4d8cf0',
  Scheduled: '#9b8cf0',
};

@Component({
  selector: 'app-flight-map',
  templateUrl: './flight-map.component.html',
  styleUrls: ['./flight-map.component.scss'],
})
export class FlightMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>;

  private map!: L.Map;
  private markersLayer = L.layerGroup();
  private routeLayer = L.layerGroup();
  private markerById = new Map<string, L.Marker>();
  private destroy$ = new Subject<void>();
  private selectedFlightId: string | null = null;

  constructor(private flightService: FlightService) {}

  ngAfterViewInit(): void {
    this.initMap();

    combineLatest([this.flightService.filteredFlights$, this.flightService.selectedFlight$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([flights, selected]) => {
        this.selectedFlightId = selected?.id ?? null;
        this.renderMarkers(flights, selected);
        this.renderRoute(selected);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.map?.remove();
  }

  private initMap(): void {
    this.map = L.map(this.mapEl.nativeElement, {
      center: [30, 10],
      zoom: 3,
      minZoom: 2,
      worldCopyJump: true,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
    this.routeLayer.addTo(this.map);
  }

  private planeIcon(flight: Flight, isSelected: boolean): L.DivIcon {
    const color = STATUS_COLOR[flight.status];
    const size = isSelected ? 30 : 22;
    return L.divIcon({
      className: 'plane-marker',
      html: `
        <div class="plane-wrap ${isSelected ? 'selected' : ''}" style="transform: rotate(${flight.currentPosition.heading}deg);">
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="#0b1220" stroke-width="0.6">
            <path d="M12 1 L14.5 9 L22.5 13 L14.5 13.6 L15.4 20 L12 18 L8.6 20 L9.5 13.6 L1.5 13 L9.5 9 Z"/>
          </svg>
        </div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  }

  private renderMarkers(flights: Flight[], selected: Flight | null): void {
    this.markersLayer.clearLayers();
    this.markerById.clear();

    flights.forEach((flight) => {
      const isSelected = selected?.id === flight.id;
      const marker = L.marker([flight.currentPosition.lat, flight.currentPosition.lng], {
        icon: this.planeIcon(flight, isSelected),
        riseOnHover: true,
      });

      marker.bindPopup(this.popupHtml(flight), { closeButton: true, className: 'flight-popup' });
      marker.on('click', () => this.flightService.selectFlight(flight.id));

      marker.addTo(this.markersLayer);
      this.markerById.set(flight.id, marker);
    });
  }

  private popupHtml(flight: Flight): string {
    return `
      <div class="popup-inner">
        <div class="popup-title">${flight.callsign} <span class="popup-status status-${flight.status.toLowerCase()}">${flight.status}</span></div>
        <div class="popup-row"><b>Flight:</b> ${flight.flightNumber}</div>
        <div class="popup-row"><b>Route:</b> ${flight.origin.code} → ${flight.destination.code}</div>
      </div>`;
  }

  private renderRoute(flight: Flight | null): void {
    this.routeLayer.clearLayers();
    if (!flight) {
      return;
    }

    const origin: L.LatLngExpression = [flight.origin.lat, flight.origin.lng];
    const destination: L.LatLngExpression = [flight.destination.lat, flight.destination.lng];
    const color = STATUS_COLOR[flight.status];

    L.polyline([origin, destination], {
      color,
      weight: 2.5,
      opacity: 0.85,
      dashArray: '6 6',
    }).addTo(this.routeLayer);

    L.circleMarker(origin, {
      radius: 5,
      color,
      fillColor: color,
      fillOpacity: 1,
      weight: 1.5,
    })
      .bindTooltip(flight.origin.code, { permanent: false })
      .addTo(this.routeLayer);

    L.circleMarker(destination, {
      radius: 5,
      color,
      fillColor: color,
      fillOpacity: 1,
      weight: 1.5,
    })
      .bindTooltip(flight.destination.code, { permanent: false })
      .addTo(this.routeLayer);

    const bounds = L.latLngBounds([origin, destination, [flight.currentPosition.lat, flight.currentPosition.lng]]);
    this.map.flyToBounds(bounds, { padding: [70, 70], maxZoom: 6, duration: 0.8 });
  }
}
