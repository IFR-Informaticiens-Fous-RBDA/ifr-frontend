import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../services/socket.service';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import * as _moment from 'moment';



const moment = _moment;

export interface AddFuelPeriod{
  start_date: Date,
  end_date: Date,
  fuel_cost: number
}

export interface FuelCost{
  aircraft_id: number,
  cost: number,
  fuel_consumption: number
}

export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};


@Component({
  selector: 'app-fuel-management',
  templateUrl: './fuel-management.component.html',
  styleUrls: ['./fuel-management.component.css'],
  providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

  {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},]
})


export class FuelManagementComponent implements OnInit {


  public dateControlStart = new UntypedFormControl(moment());
  public dateControlEnd = new UntypedFormControl(moment());

  public minDate: moment.Moment | undefined;
  public maxDate: moment.Moment | undefined;
  public stepHour = 1;
  public stepMinute = 10;
  public stepSecond = 1;
  allRoles: string[] = []
  currentUser: any
  roleUser: any


  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  displayedColumns: string[] = []
  dataToSend: AddFuelPeriod = {
    start_date: new Date(),
    end_date: new Date(),
    fuel_cost: 0.0
  }

  fuel_cost: number = 0.0
  @ViewChild('paginator') paginator!: MatPaginator;
  isPeriod: boolean = false;





  constructor(private _api: ApiService, private _socket: SocketService, private _auth: AuthService) {

  }

  ngOnInit(): void {
    this._socket.onReloadForEveryone().subscribe((data:any) => {

      this._api.getTypeRequest('finance/all-fuel-cost').subscribe((result:any) => {
        console.log(result)
        this.dataSource = new MatTableDataSource(result.data)
        this.displayedColumns = ['StartDate', 'EndDate', 'Price','Action']
      })
    })

    this._api.getTypeRequest('finance/all-fuel-cost').subscribe((result:any) => {
      console.log(result)
      this.dataSource = new MatTableDataSource(result.data)
      this.displayedColumns = ['StartDate', 'EndDate', 'Price','Action']
      })

  }

  sendData(){
    this.dataToSend.start_date = this.dateControlStart.value.toISOString()
    this.dataToSend.end_date = this.dateControlEnd.value.toISOString()
    this.dataToSend.fuel_cost = this.fuel_cost

    this._api.postTypeRequest('finance/add-fuel-cost-period', this.dataToSend).subscribe((res: any) => {
      console.log(res)
      if(res.status){
        this._socket.reloadForEveryone()
      }
    })
  }

  filterDate(date: Date | null): boolean {
    return !!date && date instanceof Date; // Ensure it's a valid date object
  }

  applyFilter(event: Event) {
    //  debugger;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator

  }

  deleteFuelPeriod(currentFuelPeriod:any){
    console.log(currentFuelPeriod)
    this._api.getTypeRequest('finance/delete-fuel-period/'+currentFuelPeriod.ID).subscribe((res:any) => {
      console.log(res)
      if(res.status){
        this._socket.reloadForEveryone()
      }
    })
  }


}
