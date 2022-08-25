import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AircraftBookingComponent } from './aircraft-booking/aircraft-booking.component';
import { LoginComponent } from './auth/components/login/login.component';
import { LogoutComponent } from './auth/components/logout/logout.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { DutyPilotBookingComponent } from './duty-pilot-booking/duty-pilot-booking.component';
import { FlightsManagementComponent } from './flights-management/flights-management.component';
import { FlightsComponent } from './flights/flights.component';
import { ProfileComponent } from './main/profile/profile.component';
import { MembersOperationalStatusComponent } from './members-operational-status/members-operational-status.component';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  {path : '', canActivate: [AuthGuardService], component: AircraftBookingComponent},
  {path : 'duty-pilot', canActivate: [AuthGuardService], component: DutyPilotBookingComponent},
  {path: 'login', component: LoginComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'flights-management', canActivate: [AuthGuardService], data: { role: 'Flights manager'}, component: FlightsManagementComponent},
  {path: 'members-operational-status', canActivate: [AuthGuardService], data: { role: 'Flights manager'}, component: MembersOperationalStatusComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'flights',component: FlightsComponent},
  {path: 'profile', canActivate: [AuthGuardService], component: ProfileComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
