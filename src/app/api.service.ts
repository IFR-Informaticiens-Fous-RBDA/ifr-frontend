import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
 constructor(private http: HttpClient) {}

  getFlightLog(){
    return this.http.get<any>("http://localhost:3000/flight-log");
  }


}
