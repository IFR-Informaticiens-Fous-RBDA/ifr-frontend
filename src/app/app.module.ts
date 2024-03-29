import { NgModule, Injectable,  CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
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
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import { AddEventDialogComponent } from './add-event-dialog/add-event-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxSpinnerModule } from "ngx-spinner";

import {
  NgxMatDatetimePickerModule,
  NgxMatNativeDateModule,
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
import { MatPaginatorModule } from '@angular/material/paginator';


import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
import { AddFlightDialogComponent } from './add-flight-dialog/add-flight-dialog.component';
import {NgxMatTimepickerModule} from 'ngx-mat-timepicker';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { RecurringEventChooserComponent } from './recurring-event-chooser/recurring-event-chooser.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FlightsManagementComponent } from './flights-management/flights-management.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatChipsModule} from '@angular/material/chips';
import {DialogModule} from 'primeng/dialog';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ToastModule} from 'primeng/toast';
import { MembersOperationalStatusComponent } from './members-operational-status/members-operational-status.component';
import { MembersManagementComponent } from './members-management/members-management.component';
import { AddDutyPilotNeededDialogComponent } from './add-duty-pilot-needed-dialog/add-duty-pilot-needed-dialog.component';
import { NotAuthorizedHandlerComponent } from './not-authorized-handler/not-authorized-handler.component';
import { AircraftPotentialComponent } from './aircraft-potential/aircraft-potential.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { FlyingCostFuelConsumptionComponent } from './flying-cost-fuel-consumption/flying-cost-fuel-consumption.component';
import { FuelManagementComponent } from './fuel-management/fuel-management.component';

import {MatExpansionModule} from '@angular/material/expansion';
import { FlightInvoicesComponent } from './flight-invoices/flight-invoices.component';
import { FuelTankManagementComponent } from './fuel-tank-management/fuel-tank-management.component';
import { FuelDeliveryManagementComponent } from './fuel-delivery-management/fuel-delivery-management.component';








const config: SocketIoConfig = {
  url: environment.socketUrl,
  options: {
    transports: ['websocket']
  }
}


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
    AddFlightDialogComponent,
    RecurringEventChooserComponent,
    FlightsManagementComponent,
    MembersOperationalStatusComponent,
    MembersManagementComponent,
    AddDutyPilotNeededDialogComponent,
    NotAuthorizedHandlerComponent,
    AircraftPotentialComponent,
    ConfirmationDialogComponent,
    FlyingCostFuelConsumptionComponent,
    FuelManagementComponent,
    FlightInvoicesComponent,
    FuelTankManagementComponent,
    FuelDeliveryManagementComponent,
  ],
  exports: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    NgxSpinnerModule,
    AppRoutingModule,
    MatTableModule,
    ToastModule,
    MatCheckboxModule,
    ConfirmPopupModule,
    MatExpansionModule,
    MatDatepickerModule,
    DialogModule,
    MatAutocompleteModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    NgxMatDatetimePickerModule,
    FormsModule,
    MatSidenavModule,
    ReactiveFormsModule,
    NgxMatNativeDateModule,
    MatChipsModule,
    NgxMatTimepickerModule,
    MatInputModule,
    MatToolbarModule,
    AuthModule,
    SocketIoModule.forRoot(config),
    MatSelectModule,
    MatDialogModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    MatFormFieldModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }, { utils: {
      provide: BaseCalendarUtils, useClass: CalendarUtils
    }}),
    FontAwesomeModule,
    NgbModule
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
    },
    {
      provide: MAT_DATE_LOCALE, useValue: 'fr'
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
