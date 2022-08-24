import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private _api: ApiService) { }

  public roles = []

   getUserDetails() {
    if(localStorage.getItem('userData')){

      return localStorage.getItem('userData')

    }else{
      return null
    }

  }

  getRole(): any[]{
    this._api.getTypeRequest('user/role/' + JSON.parse(localStorage.getItem('userData') || '{}')[0].id).subscribe((result: any) => {
      console.log(result.data)
      this.roles = result.data
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
