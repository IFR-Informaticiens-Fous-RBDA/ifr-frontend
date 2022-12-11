import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl = 'https://infinite-harbor-32161.herokuapp.com/';

  constructor(private _http: HttpClient) {
  }



  getTypeRequest(url: any) {
    return this._http.get(`${environment.api}${url}`).pipe(map(res => {
      return res;
    }));
  }

  postTypeRequest(url: any, payload: any) {
    return this._http.post(`${environment.api}${url}`, payload).pipe(map(res => {
      return res;
    }));
  }

  putTypeRequest(url: any, payload: any) {
    return this._http.put(`${environment.api}${url}`, payload).pipe(map(res => {
      return res;
    }));
  }

}
