import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { compareAsc } from 'date-fns';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../services/socket.service';

export interface AddCostAndFuelPeriod{
  aircraft_id: number,
  cost: number,
  fuel_consumption: number,
  start_date: Date,
  end_date: Date
}

export interface AircraftCostAndFuel{
  aircraft_id: number,
  cost: number,
  fuel_consumption: number
}

@Component({
  selector: 'app-flying-cost-fuel-consumption',
  templateUrl: './flying-cost-fuel-consumption.component.html',
  styleUrls: ['./flying-cost-fuel-consumption.component.css']
})
export class FlyingCostFuelConsumptionComponent implements OnInit {

  public dateControlStart = new UntypedFormControl(new Date());
  public dateControlEnd = new UntypedFormControl(new Date());
  public minDate: moment.Moment | undefined;
  public maxDate: moment.Moment | undefined;
  public stepHour = 1;
  public stepMinute = 10;
  public stepSecond = 1;
  allRoles: string[] = []
  currentUser: any
  roleUser: any
  aircraft_id: any
  planes: any[] = []
  aircrafts: any[] = []

  selectedAircraft: string = ""

  bi_cost: number = 0.0
  bi_consumption: number=0.0
  bu_cost: number = 0.0
  bu_consumption: number = 0.0
  by_cost: number = 0.0
  by_consumption: number = 0.0
  bq_cost: number = 0.0
  bq_consumption: number = 0.0
  bq_potential: string=""

  cost: number = 0.0
  fuel_consumption: number = 0.0

  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  displayedColumns: string[] = []
  dataToSend: AddCostAndFuelPeriod = {
    aircraft_id: 99,
    cost: 0.0,
    fuel_consumption: 0.0,
    start_date: new Date(),
    end_date: new Date()
  }
  aicraft_potential: AircraftCostAndFuel = {
    aircraft_id: 99,
    cost: 0.0,
    fuel_consumption: 0.0
  }
  aircrafts_cost_fuel: AircraftCostAndFuel[] = []
  @ViewChild('paginator') paginator!: MatPaginator;
  isPeriod: boolean = false;





  constructor(private _api: ApiService, private _socket: SocketService, private _auth: AuthService) { }

  ngOnInit(): void {
    this._socket.onReloadForEveryone().subscribe((data:any) => {

      this._api.getTypeRequest('finance/all').subscribe((result:any) => {
      this.dataSource = new MatTableDataSource(result.data)
      this.displayedColumns = ['registration', 'StartDate', 'EndDate', 'FlyingCost', 'AverageFuelConsumption', 'Action']
      })

      this._api.getTypeRequest('aircraft/all').subscribe((res:any) => {
        this.aircrafts = res.data
        console.log(this.aircrafts)
      })
      this._api.getTypeRequest('finance/last-period-data').subscribe(((result: any) => {
        this.planes = result.data
        console.log(this.planes)
        this.planes.forEach((plane: any) => {
          const aircraft = this.aircrafts.find((ac: any) => ac.registration === plane.registration);
          if (aircraft) {
            plane.Color_secondary = aircraft.Color_secondary;
          }
        });
        console.log(this.planes)

    }))
    })

    this._api.getTypeRequest('aircraft/all').subscribe((res:any) => {
      this.aircrafts = res.data
      console.log(this.aircrafts)

    })

    this._api.getTypeRequest('finance/all').subscribe((result:any) => {
      console.log(result)
      this.dataSource = new MatTableDataSource(result.data)
      this.displayedColumns = ['registration', 'StartDate', 'EndDate', 'FlyingCost', 'AverageFuelConsumption', 'Action']
      })

    this._api.getTypeRequest('finance/last-period-data').subscribe(((result: any) => {
      this.planes = result.data
      console.log(this.planes)
      this.planes.forEach((plane: any) => {
        const aircraft = this.aircrafts.find((ac: any) => ac.registration === plane.registration);
        if (aircraft) {
          plane.Color_secondary = aircraft.Color_secondary;
        }
      });
      console.log(this.planes)
    }))

    this._auth.getUserDetails().then(currentUser => {
      this.currentUser = currentUser

      this._api.getTypeRequest('user/role/' + this.currentUser[0].id).subscribe((result: any) => {
        console.log(result)
        this.roleUser = result.data
        for(let i = 0; i < this.roleUser.length; i++){
          this.allRoles = [
            ...this.allRoles, this.roleUser[i].Role_Name
          ]
        }
      })

    })

  }


  addPeriod(){
    this.isPeriod = true
  }

  async onSelectAircraft(selectedAircraft: any){
    this.aircraft_id = await this._api.getTypeRequest('aircraft/aircraft-id-by-name/' + selectedAircraft.value).toPromise()
  }

  sendData(){
    this.dataToSend.aircraft_id = this.aircraft_id[0]
    this.dataToSend.cost = this.cost
    this.dataToSend.start_date = this.dateControlStart.value
    this.dataToSend.end_date = this.dateControlEnd.value
    this.dataToSend.fuel_consumption = this.fuel_consumption

    this._api.postTypeRequest('finance/add-cost-period', this.dataToSend).subscribe((res: any) => {
      console.log(res)
      if(res.status){
        this._socket.reloadForEveryone()
      }
    })
  }

  applyFilter(event: Event) {
    //  debugger;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator

  }

  deleteFlyingCost(currentFlyingCost:any){
    console.log(currentFlyingCost)
    this._api.getTypeRequest('finance/delete-flying-cost/'+currentFlyingCost.ID).subscribe((res:any) => {
      console.log(res)
      if(res.status){
        this._socket.reloadForEveryone()
      }
    })
  }

}
