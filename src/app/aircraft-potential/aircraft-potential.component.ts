import { Component, OnInit, ViewChild } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { compareAsc } from 'date-fns';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../services/socket.service';

export interface AddInspection{
  aircraft_id: number,
  hour_meter: string,
  reason: string,
  description: string,
  completed: boolean
}

export interface AircraftPotential{
  aircraft_id: number,
  time_left: {
    flight_time: string
  }
}

@Component({
  selector: 'app-aircraft-potential',
  templateUrl: './aircraft-potential.component.html',
  styleUrls: ['./aircraft-potential.component.css']
})


export class AircraftPotentialComponent implements OnInit {

  allRoles: string[] = []
  currentUser: any
  roleUser: any
  aircraft_id: any
  inspection: boolean = false
  aircrafts: string[] = []
  selectedAircraft: string = ""
  engine_last_start: any
  reason: string = ""
  bi_potential: string=""
  bu_potential: string=""
  by_potential: string=""
  bq_potential: string=""
  time_before_inspection: any
  description: string = ""
  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  displayedColumns: string[] = []
  dataToSend: AddInspection = {
    aircraft_id: 99,
    hour_meter: "",
    reason: "",
    description: "",
    completed: false
  }
  aicraft_potential: AircraftPotential = {
    aircraft_id: 99,
    time_left: {
      flight_time: ""
    }
  }
  aircrafts_potential: AircraftPotential[] = []
  @ViewChild('paginator') paginator!: MatPaginator;





  constructor(private _api: ApiService, private _socket: SocketService, private _auth: AuthService) { }

  ngOnInit(): void {
    this._socket.onReloadForEveryone().subscribe((data:any) => {

      this._api.getTypeRequest('inspection/all').subscribe((result:any) => {
      this.dataSource = new MatTableDataSource(result.data)
      this.displayedColumns = ['registration', 'hour_meter', 'reason', 'description', 'status']
      let onlyCompletedInspection = this.dataSource.data.filter(element => !element.completed)
      this.computeFlightTime(onlyCompletedInspection)
      })
    })

    this._auth.getUserDetails().then(currentUser => {
      this.currentUser = currentUser

      this._api.getTypeRequest('user/role/' + this.currentUser[0].id).subscribe((result: any) => {
        this.roleUser = result.data
        for(let i = 0; i < this.roleUser.length; i++){
          this.allRoles = [
            ...this.allRoles, this.roleUser[i].Role_Name
          ]
        }
      })
      this._api.getTypeRequest('inspection/all').subscribe((result:any) => {
        this.dataSource = new MatTableDataSource(result.data)
        this.displayedColumns = ['registration', 'hour_meter', 'reason', 'description', 'status']
        let onlyCompletedInspection = this.dataSource.data.filter(element => !element.completed)
        this.computeFlightTime(onlyCompletedInspection)

      })
    })

  }

  async computeFlightTime(completedInspection: any[]){
    for(var i = 0; i < completedInspection.length; i++){

      let result: any = await this._api.getTypeRequest('flights/last-flight/' + completedInspection[i].aircraft_id).toPromise()
      let body = {start: result.data[0].Engine_Stop, end: completedInspection[i].hour_meter}
      this.time_before_inspection = await this._api.postTypeRequest('flights/computeFlightTime', body).toPromise()
      this.aircrafts_potential = [
        ...this.aircrafts_potential,
        {
          aircraft_id: completedInspection[i].aircraft_id,
          time_left: this.time_before_inspection
        }
      ]
      if(completedInspection[i].aircraft_id === 1){
        this.bi_potential = this.time_before_inspection.flight_time
      }
      if(completedInspection[i].aircraft_id === 2){
        this.bu_potential = this.time_before_inspection.flight_time
      }
      if(completedInspection[i].aircraft_id === 3){
        this.by_potential = this.time_before_inspection.flight_time
      }
      if(completedInspection[i].aircraft_id === 4){
        this.bq_potential = this.time_before_inspection.flight_time
      }
    }
    if(completedInspection.find(element => element.aircraft_id === 1) === undefined){
      this.bi_potential = ''
    }
    if(completedInspection.find(element => element.aircraft_id === 2) === undefined){
      this.bu_potential = ''
    }
    if(completedInspection.find(element => element.aircraft_id === 3) === undefined){
      this.by_potential = ''
    }
    if(completedInspection.find(element => element.aircraft_id === 4) === undefined){
      this.bq_potential = ''
    }



  }

  defineInspection(){
    this.inspection = true
    this._api.getTypeRequest('aircraft/all').subscribe((res:any) => {
      this.aircrafts = res.data
    })

  }

  async onSelectAircraft(selectedAircraft: any){
    this.aircraft_id = await this._api.getTypeRequest('aircraft/aircraft-id-by-name/' + selectedAircraft.value).toPromise()
    this._api.getTypeRequest('flights/last-flight/' + this.aircraft_id[0]).subscribe((res: any) => {
      if(res.status && res.data.length != 0){
        this.engine_last_start = res.data[0].Engine_Stop
      }
      else{
        this.engine_last_start=""
      }
    })
  }

  sendData(){
    this.dataToSend.aircraft_id = this.aircraft_id[0]
    this.dataToSend.hour_meter = this.engine_last_start
    this.dataToSend.reason = this.reason
    this.dataToSend.description = this.description
    this.dataToSend.completed = this.dataToSend.completed

    this._api.postTypeRequest('inspection/add-inspection', this.dataToSend).subscribe((res: any) => {
      if(res.status){
        this._socket.reloadForEveryone()
      }
    })
  }

  onNoClick(){
    this.inspection = false
  }
  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator

  }
  async setInspectionComplete(currentInspection: any){
    let result_complete:any = await this._api.getTypeRequest('inspection/complete-inspection/' + currentInspection.id).toPromise()
    if(result_complete.status){
      this._socket.reloadForEveryone()
    }
  }

  deleteInspection(currentInspection:any){
    this._api.getTypeRequest('inspection/delete-inspection/'+currentInspection.id).subscribe((res:any) => {
      if(res.status){
        this._socket.reloadForEveryone()
      }
    })
  }



}

