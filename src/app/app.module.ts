import { NgModule, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CalendarUtils as BaseCalendarUtils } from 'angular-calendar';
import {GetWeekViewArgs, WeekView, getWeekView} from 'calendar-utils';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';

import{CalendarUtils} from './aircraft-booking/aircraft-booking.component'

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
import { UpdateEventComponent } from './update-event/update-event.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ShowEventDialogComponent } from './show-event-dialog/show-event-dialog.component';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { DutyPilotBookingComponent } from './duty-pilot-booking/duty-pilot-booking.component';
import { AddDutyPilotDialogComponent } from './add-duty-pilot-dialog/add-duty-pilot-dialog.component';
import { LogoutComponent } from './auth/components/logout/logout.component';
import { FlightsComponent } from './flights/flights.component';
import { MatTableModule } from '@angular/material/table'







@NgModule({
  declarations: [
    AppComponent,
    DayViewSchedulerComponent,
    AircraftBookingComponent,
    AddEventDialogComponent,
    ProfileComponent,
    UpdateEventComponent,
    ShowEventDialogComponent,
    DutyPilotBookingComponent,
    AddDutyPilotDialogComponent,
    LogoutComponent,
    FlightsComponent,
  ],
  exports: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    MatTableModule,
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
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }, { utils: {
      provide: BaseCalendarUtils, useClass: CalendarUtils
    }}),
    FontAwesomeModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {disableCLose: true}
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
