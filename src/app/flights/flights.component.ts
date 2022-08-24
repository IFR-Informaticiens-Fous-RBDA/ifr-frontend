import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddFlightDialogComponent } from '../add-flight-dialog/add-flight-dialog.component';
import { ApiService } from '../services/api.service';
import { SocketService } from '../services/socket.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';


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
  @ViewChild('paginator') paginator!: MatPaginator;


  constructor(private _api: ApiService, private _socket: SocketService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this._socket.onReloadForEveryone().subscribe((data:any) => {
        this._api.postTypeRequest('flights/all-flights', this.currentUser).subscribe((result:any) => {
        this.dataSource = new MatTableDataSource(result.data)
        this.dataSource.data = this.dataSource.data.filter((item: { isLogged: any; }) => item.isLogged === 0)
        this.dataSource.data.forEach(function(element : any){
          element.date_depart = new Date(element.date_depart)
          element.date_arrivee = new Date(element.date_arrivee)
        })
        this.displayedColumns = ['id', 'registration', 'description', 'date_depart', 'date_arrivee', 'status']
      });
    })
    this.currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
    this._api.postTypeRequest('flights/all-flights', this.currentUser).subscribe((result:any) => {
      this.dataSource = new MatTableDataSource(result.data)
      this.dataSource.data = this.dataSource.data.filter((item: { isLogged: any; }) => item.isLogged === 0)
      this.dataSource.data.forEach(function(element : any){
        element.date_depart = new Date(element.date_depart)
        element.date_arrivee = new Date(element.date_arrivee)
      })

    this._api.postTypeRequest('flights/all-logged-flights', this.currentUser).subscribe((result: any) => {
      this.pastFlights.data = result.data

    })
      this.displayedColumns = ['id', 'registration', 'description', 'date_depart', 'date_arrivee', 'status']
      this.displayedColumnsLog = ['Registration','Date_Of_Flight', 'Departure_ICAO_Code', 'Departure_Time', 'Arrival_ICAO_Code', 'Arrival_Time', 'Total_Time_Of_Flight', 'FirstName', 'LastName', 'ShortName', 'Landings_Number_Day', 'Name', 'Engine_Start', 'Engine_Stop', 'Engine_Time']

    });
  }
  logFlight(element:any){
    const dialogRef = this.dialog.open(AddFlightDialogComponent, {
      width:'500px',
      data: {
        currentEvent: element,
        currentUser: this.currentUser[0].id,
        slot: element.date_depart,
        aircraft_id: element.aircraft_id
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result =>{
      if(result != undefined){
        this.selectedInstructor = result.instructor
        this._api.postTypeRequest('flights/log-flight', result).subscribe((result:any) => {
          element.IsActive = result.data[0].IsActive
          element.flight_started = result.data[0].flight_started
          this.dataSource.data = this.dataSource.data.map((item: { registration: any; }) => {
            if(item.registration === element.registration){
              return {...item, IsActive: 0}
            }
            return item
          })

          this.dataSource.data = this.dataSource.data.filter((item: { id: any; }) => item.id !== element.id)

          this._socket.reloadForEveryone()
        })
        this._api.postTypeRequest('flights/last-logged-flight', this.currentUser).subscribe((result: any) => {
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
