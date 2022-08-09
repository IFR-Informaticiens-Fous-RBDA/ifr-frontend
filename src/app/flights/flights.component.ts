import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-flights',
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.css']
})
export class FlightsComponent implements OnInit {
  currentUser: any;
  dataSource: any;
  displayedColumns: string[] = [];
  pastFlights: Array<any> = [];


  constructor(private _api: ApiService) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
    this._api.postTypeRequest('flights/all-flights', this.currentUser).subscribe((result:any) => {
      console.log(result)
      this.dataSource = result.data
      console.log(typeof(result.data[0].date_depart))
      this.dataSource.forEach(function(element : any){
        element.date_depart = new Date(element.date_depart)
        element.date_arrivee = new Date(element.date_arrivee)
      })
      this.displayedColumns = ['id', 'registration', 'description', 'date_depart', 'date_arrivee', 'status']
    });
  }
  logFlight(element:any){
    console.log(element)
    this._api.postTypeRequest('flights/log-flight', element).subscribe((result: any) => {
      console.log(result)

      element.IsActive = result.data[0].IsActive
      element.flight_started = result.data[0].flight_started
      this.dataSource = this.dataSource.map((item: { registration: any; }) => {
        if(item.registration === element.registration){
          return {...item, IsActive: 0}
        }
        return item
      })

      console.log(this.dataSource)

    })

  console.log(this.dataSource)
  this.dataSource = this.dataSource.filter((item: { id: any; }) => item.id !== element.id)

  this.pastFlights = [
    ...this.pastFlights, element
  ]
  console.log(this.pastFlights)
  }
  goFlying(element: any){
    console.log(element)
    this._api.postTypeRequest('flights/ground-me', element).subscribe((result: any) => {
      console.log(result)

      element.IsActive = result.data[0].IsActive
      element.flight_started = result.data[0].flight_started
      this.dataSource = this.dataSource.map((item: { registration: any; }) => {
        if(item.registration === element.registration){
          return {...item, IsActive: 1}
        }
        return item
      })

      console.log(this.dataSource)

    })
  }
}
