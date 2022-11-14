import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  public res: any
  public res2 : any
  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _api : ApiService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let url = state.root.url
    return this.checkUserLogin(next, url)
  }

  async checkUserLogin(route: ActivatedRouteSnapshot, url: any) {
    if(this._authService.getToken()){
      const userRole = this._authService.getRole()
      if(route.data.role && userRole.filter(e => e.Role_Name === route.data.role).length === 0){
        this._router.navigate(['']);
        return false
      }
      if(route.data.operationalAvailability){
        const current_user = JSON.parse(this._authService.getUserDetails()!)
        this.res = await this._api.getTypeRequest('user/member-id/' + current_user[0].id).toPromise()
        let member_id = this.res.data[0].ID_Member

        this.res2 = await this._api.getTypeRequest('user/operational-availability/' + current_user[0].id + '/' + member_id).toPromise()
        console.log(this.res2)
        let member_availability_dates = this.res2.data
        if(member_availability_dates.length === 0){
          this._router.navigate(['not-authorized'])
          return false
        }
        member_availability_dates[0].Medical_class_validity = new Date(member_availability_dates[0].Medical_class_validity)
        member_availability_dates[0].Sep_validity = new Date(member_availability_dates[0].Sep_validity)
        member_availability_dates[0].end = new Date(member_availability_dates[0].end)
        member_availability_dates[0].validity_date = new Date(member_availability_dates[0].validity_date)
        if(member_availability_dates[0].Medical_class_validity.getTime() < Date.now() || member_availability_dates[0].Sep_validity.getTime() < Date.now() || member_availability_dates[0].end.getTime() > Date.now() || member_availability_dates[0].validity_date.getTime() < Date.now()){
          this._router.navigate(['not-authorized'])
          return false
        }
      }
      return true
    }

    this._router.navigate(['login'])
    return false
  }
}
