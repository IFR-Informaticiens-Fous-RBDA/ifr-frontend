import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlightInvoiceService {

  private readonly BASE_URL = '/finance/flight-invoices';

  constructor(private http: HttpClient) { }

  getFlightInvoiceData(year: number, month: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE_URL}/${year}/${month}`);
  }

}
