import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _api: ApiService) { }

  public roles = []

  public payload: any = null
  private _currentAuth = new BehaviorSubject(this.payload)
  currentAuth = this._currentAuth.asObservable()

   async getUserDetails() {
    if(localStorage.getItem('token')){
      let payload: any = await this._api.postTypeRequest('user/check-token', {message: localStorage.getItem('token')}).toPromise()
      this.changeAuth(payload)
      return payload.payload.data

    }else{
      return null
    }

  }

  changeAuth(payload: any){
    this._currentAuth.next(payload)
  }

  getRole(): any[]{
    this._api.postTypeRequest('user/check-token', {message: localStorage.getItem('token')}).subscribe((res: any) => {
      this._api.getTypeRequest('user/role/' + res.payload.data[0].id).subscribe((result: any) => {
        this.roles = result.data
      })
    })

    return this.roles
  }

  setDataInLocalStorage(variableName: string, data: string) {
      localStorage.setItem(variableName, data);
  }

  getToken() {
      return localStorage.getItem('token');
  }

  clearStorage() {
      localStorage.clear();
  }
}
