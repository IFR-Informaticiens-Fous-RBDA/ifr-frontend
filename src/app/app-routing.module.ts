import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AircraftBookingComponent } from './aircraft-booking/aircraft-booking.component';
import { AircraftPotentialComponent } from './aircraft-potential/aircraft-potential.component';
import { LoginComponent } from './auth/components/login/login.component';
import { LogoutComponent } from './auth/components/logout/logout.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { DutyPilotBookingComponent } from './duty-pilot-booking/duty-pilot-booking.component';
import { FlightsManagementComponent } from './flights-management/flights-management.component';
import { FlightsComponent } from './flights/flights.component';
import { ProfileComponent } from './main/profile/profile.component';
import { MembersManagementComponent } from './members-management/members-management.component';
import { MembersOperationalStatusComponent } from './members-operational-status/members-operational-status.component';
import { NotAuthorizedHandlerComponent } from './not-authorized-handler/not-authorized-handler.component';
import { AuthGuardService } from './services/auth-guard.service';

const routes: Routes = [
  {path : '', canActivate: [AuthGuardService], data:{operationalAvailability: true}, component: AircraftBookingComponent},
  {path : 'duty-pilot', canActivate: [AuthGuardService], component: DutyPilotBookingComponent},
  {path: 'login', component: LoginComponent},
  {path: 'not-authorized', component:NotAuthorizedHandlerComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'flights-management', canActivate: [AuthGuardService], component: FlightsManagementComponent},
  {path: 'members-operational-status', canActivate: [AuthGuardService], data: { role: 'Flights manager'}, component: MembersOperationalStatusComponent},
  {path: 'members-management', canActivate:[AuthGuardService], data: {role: 'Secretary'}, component: MembersManagementComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'flights',component: FlightsComponent},
  {path: 'profile', canActivate: [AuthGuardService], component: ProfileComponent},
  {path: 'aircraft-potential-management', canActivate: [AuthGuardService], component: AircraftPotentialComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
