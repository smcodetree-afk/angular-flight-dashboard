import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { DashboardComponent } from './features/dashboard/dashboard.component';
import { KpiCardsComponent } from './features/kpi-cards/kpi-cards.component';
import { FlightSidebarComponent } from './features/flight-sidebar/flight-sidebar.component';
import { FlightMapComponent } from './features/flight-map/flight-map.component';
import { FlightDetailsComponent } from './features/flight-details/flight-details.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    KpiCardsComponent,
    FlightSidebarComponent,
    FlightMapComponent,
    FlightDetailsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
