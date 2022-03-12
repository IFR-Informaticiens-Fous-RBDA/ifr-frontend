import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];


@Component({
  selector: 'app-flight-log',
  templateUrl: './flight-log.component.html',
  styleUrls: ['./flight-log.component.css']
})
export class FlightLogComponent implements OnInit {
  flightLog : any
  displayedColumns: string[] = ['date', 'airport departure', 'departure time', 'airport arrival', 'arrival time', 'flight duration', 'PIC name', 'instructor name', 'student name', 'type of runway', 'number of landings day', 'number of landing night', 'VFR', 'IFR', 'night', 'nature of flight', 'engine start', 'engine stop', 'engine time', 'inspection hours', 'oil added before', 'oil added after', 'fuel added before', 'fuel added after', 'passenger number', 'passenger names', 'remarks'];
  dataSource : any

  constructor(private apiService: ApiService) {
    this.apiService.getFlightLog().subscribe(data => {
      this.dataSource = data
    })
  }

  ngOnInit(): void {
  }

}
