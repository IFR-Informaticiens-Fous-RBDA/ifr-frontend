import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { PlaneBookingComponent } from './plane-booking/plane-booking.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { FlightLogComponent } from './flight-log/flight-log.component';
import {MatTableModule} from '@angular/material/table';
import {CdkTableModule} from '@angular/cdk/table';



@NgModule({
  declarations: [
    AppComponent,
    PlaneBookingComponent,
    FlightLogComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    MatTableModule,
    CdkTableModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
