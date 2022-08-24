import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let url = state.root.url
    return this.checkUserLogin(next, url)


  }

  checkUserLogin(route: ActivatedRouteSnapshot, url: any): boolean {
    if(this._authService.getToken()){
      const userRole = this._authService.getRole()
      console.log(userRole)
      if(route.data.role && userRole.filter(e => e.Role_Name === route.data.role).length === 0){
        this._router.navigate(['']);
        return false
      }
      return true
    }

    this._router.navigate(['login'])
    return false
  }
}
