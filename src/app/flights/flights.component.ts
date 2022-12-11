import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddFlightDialogComponent } from '../add-flight-dialog/add-flight-dialog.component';
import { ApiService } from '../services/api.service';
import { SocketService } from '../services/socket.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';



@Component({
  selector: 'app-flights',
  templateUrl: './flights.component.html',
  styleUrls: ['./flights.component.css']
})
export class FlightsComponent implements OnInit, AfterViewInit {
  currentUser: any;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  pastFlights: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[] = [];
  displayedColumnsLog: string[] = []
  selectedInstructor: any
  dateNow: number = Date.now()
  subscription!: Subscription;
  legs_number: number[] = []
  legs_index!: number
  intervalId!: number;
  @ViewChild('paginator') paginator!: MatPaginator;


  constructor(private _api: ApiService, private _socket: SocketService, public dialog: MatDialog, private _auth: AuthService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    const source = interval(1000)
    this.spinner.show()
    this.subscription = source.subscribe(val => this.opensnack())
    this._socket.onReloadForEveryone().subscribe((data:any) => {
      this._api.getTypeRequest('flights/all-flights').subscribe((result:any) => {
        this.dataSource = new MatTableDataSource(result.data)
        this.dataSource.data = this.dataSource.data.filter((item: { isLogged: any; isMaintenance: number }) => item.isLogged === 0 && (item.isMaintenance === 0 || item.isMaintenance === null))
        this.dataSource.data.forEach(function(element : any){
          element.date_depart = new Date(element.date_depart)
          element.date_arrivee = new Date(element.date_arrivee)

        })
        for(let i = 0; i < this.dataSource.data.length; i++){
          this.legs_number[i] = 1
        }

      this._api.getTypeRequest('flights/all-logged-flights').subscribe((result: any) => {
        this.pastFlights.data = result.data

      })
        this.displayedColumns = ['id', 'registration', 'description', 'date_depart', 'date_arrivee', 'status']
        this.displayedColumnsLog = ['Registration','Date_Of_Flight', 'Departure_ICAO_Code', 'Departure_Time', 'Arrival_ICAO_Code', 'Arrival_Time', 'Total_Time_Of_Flight', 'FirstName', 'LastName', 'ShortName', 'Landings_Number_Day', 'Name', 'Engine_Start', 'Engine_Stop', 'Engine_Time']

      });
      this.spinner.hide()
    })
    this._auth.getUserDetails().then(currentUser => {
      this.currentUser = currentUser

      this._api.getTypeRequest('flights/all-flights').subscribe((result:any) => {
        this.dataSource = new MatTableDataSource(result.data)
        this.dataSource.data = this.dataSource.data.filter((item: { isLogged: any; isMaintenance: number }) => item.isLogged === 0 && (item.isMaintenance === 0 || item.isMaintenance === null))
        this.dataSource.data.forEach(function(element : any){
          element.date_depart = new Date(element.date_depart)
          element.date_arrivee = new Date(element.date_arrivee)

        })
        for(let i = 0; i < this.dataSource.data.length; i++){
          this.legs_number[i] = 1
        }

      this._api.getTypeRequest('flights/all-logged-flights').subscribe((result: any) => {
        this.pastFlights.data = result.data

      })
        this.displayedColumns = ['id', 'registration', 'description', 'date_depart', 'date_arrivee', 'status']
        this.displayedColumnsLog = ['Registration','Date_Of_Flight', 'Departure_ICAO_Code', 'Departure_Time', 'Arrival_ICAO_Code', 'Arrival_Time', 'Total_Time_Of_Flight', 'FirstName', 'LastName', 'ShortName', 'Landings_Number_Day', 'Name', 'Engine_Start', 'Engine_Stop', 'Engine_Time']

      });
      this.spinner.hide()
    })
  }
  opensnack() {
    this.dateNow = this.dateNow + 1000
    this.dataSource.data.forEach((element : any) =>{
      if(!element.flight_started && this.dateNow > element.date_depart && this.dateNow < element.date_arrivee){
        this._api.postTypeRequest('flights/ground-me', element).subscribe((result: any) => {

          element.IsActive = result.data[0].IsActive
          element.flight_started = result.data[0].flight_started
          this.dataSource.data = this.dataSource.data.map((item: { registration: any; }) => {
            if(item.registration === element.registration){
              return {...item, IsActive: 1}
            }
            return item
          })
          this._socket.reloadForEveryone();

        })
      }
      if(element.IsActive && this.dateNow > element.date_arrivee){
        this._api.postTypeRequest('flights/unground-me', element).subscribe((result: any) => {

          element.IsActive = result.data[0].IsActive
          element.flight_started = result.data[0].flight_started
          this.dataSource.data = this.dataSource.data.map((item: { registration: any; }) => {
            if(item.registration === element.registration){
              return {...item, IsActive: 0}
            }
            return item
          })
          this._socket.reloadForEveryone();

        })
      }

    })
  }
  ngOnDestroy(){
    this.subscription && this.subscription.unsubscribe()
    clearInterval(this.intervalId)
  }
  getIndex(index: any){
    this.legs_index = index
  }
  cancelFlight(element: any, index:any){
    this.spinner.show()
    this._api.getTypeRequest('event/delete-event/' + element.id).subscribe((res:any) => {
      this._socket.reloadForEveryone()
      this.spinner.hide()
    })
  }
  logFlight(element:any, index:any){
    this.legs_index = index
    const dialogRef = this.dialog.open(AddFlightDialogComponent, {
      width:'50vw',
      data: {
        currentEvent: element,
        currentUser: this.currentUser[0],
        slot: element.date_depart,
        aircraft_id: element.aircraft_id,
        legs_number: this.legs_number[this.legs_index],
        legs_index: this.legs_index
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result =>{
      delete result['currentUser']
      if(this.legs_number[this.legs_index] > 1){
        this._api.postTypeRequest('flights/log-leg', result).subscribe((result:any) => {
          this.legs_number[this.legs_index] = this.legs_number[this.legs_index] -1
        })
        this._api.getTypeRequest('flights/last-logged-flight').subscribe((result: any) => {
          const index = this.pastFlights.data.findIndex(element => element.ID === result.data[0].ID)
          if(index === -1){
            this.pastFlights.data = [
              ...this.pastFlights.data, result.data[0]
            ]
          }
        })
      }
      if(result != undefined && this.legs_number[this.legs_index] === 1){
        this.selectedInstructor = result.instructor
        this._api.postTypeRequest('flights/log-flight', result).subscribe((result:any) => {
          element.IsActive = result.data[0].IsActive
          this.dataSource.data = this.dataSource.data.map((item: { registration: any; }) => {
            if(item.registration === element.registration){
              return {...item, IsActive: 0}
            }
            return item
          })

          this.dataSource.data = this.dataSource.data.filter((item: { id: any; }) => item.id !== element.id)

          this._socket.reloadForEveryone()
        })
        this._api.getTypeRequest('flights/last-logged-flight').subscribe((result: any) => {
          const index = this.pastFlights.data.findIndex(element => element.ID === result.data[0].ID)
          if(index === -1){
            this.pastFlights.data = [
              ...this.pastFlights.data, result.data[0]
            ]
          }
        })
      }
    })





  }

  ngAfterViewInit(){
    this.pastFlights.paginator = this.paginator

  }

  goFlying(element: any){
    this._api.postTypeRequest('flights/ground-me', element).subscribe((result: any) => {

      element.IsActive = result.data[0].IsActive
      element.flight_started = result.data[0].flight_started
      this.dataSource.data = this.dataSource.data.map((item: { registration: any; }) => {
        if(item.registration === element.registration){
          return {...item, IsActive: 1}
        }
        return item
      })
      this._socket.reloadForEveryone();

    })
  }
  applyFilter(event: Event) {
    //  debugger;
    const filterValue = (event.target as HTMLInputElement).value;
    this.pastFlights.filter = filterValue.trim().toLowerCase();
  }
}
