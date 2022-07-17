import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';

import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { CommonModule } from '@angular/common';
import { DayViewSchedulerComponent } from '../app/day-view-scheduler/day-view-scheduler.component';
import { AircraftBookingComponent } from './aircraft-booking/aircraft-booking.component';

import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { AddEventDialogComponent } from './add-event-dialog/add-event-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
  NgxMatTimepickerModule
} from '@angular-material-components/datetime-picker';


import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSidenavModule} from '@angular/material/sidenav';

import {MatListModule} from '@angular/material/list'
import {MatMenuModule} from '@angular/material/menu';
import { AuthModule } from './auth/auth/auth.module';
import { ProfileComponent } from './main/profile/profile.component';
import { InterceptorService } from './services/interceptor-service.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';






@NgModule({
  declarations: [
    AppComponent,
    DayViewSchedulerComponent,
    AircraftBookingComponent,
    AddEventDialogComponent,
    ProfileComponent,
  ],
  exports: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    MatDatepickerModule,
    MatListModule,
    MatMenuModule,
    NgxMatDatetimePickerModule,
    FormsModule,
    MatSidenavModule,
    ReactiveFormsModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule,
    MatInputModule,
    MatToolbarModule,
    AuthModule,
    MatSelectModule,
    MatDialogModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    MatFormFieldModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
