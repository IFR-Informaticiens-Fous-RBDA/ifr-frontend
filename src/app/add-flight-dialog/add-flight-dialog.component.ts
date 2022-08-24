import {Component, Inject, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AircraftBookingComponent } from '../aircraft-booking/aircraft-booking.component';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { NgxMatTimepickerComponent } from 'ngx-mat-timepicker';


export interface DialogData {
  currentEvent: any
  currentUser: any
  slot: any,
  aircraft_id: number,
  date_of_flight: any,
  departure_icao_code: any,
  departure_time: any,
  arrival_icao_code: any,
  arrival_time: any,
  total_time_of_flight: any,
  instructor: any,
  type_of_runway: any,
  landings_number_day: any,
  night_flight: any,
  landings_number_night: any,
  nature_of_flight: any,
  engine_start: any,
  engine_stop: any,
  engine_time: any,
  oil_added_before: any,
  oil_added_after: any,
  fuel_added_before: any,
  fuel_added_after: any,
  passengers: any,
  remarks: any
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'add-flight-dialog.component.html',
  styleUrls: ['./add-flight-dialog.component.css']
})
export class AddFlightDialogComponent {

  public date: moment.Moment | undefined;
  public disabled = false;
  public color: ThemePalette = 'primary';
  public instructors: any
  public instructorsList: string[] = []
  public nature_of_flightsList: string[] = []
  public type_of_runwayList: string[] = []
  public type_of_runway: any
  public nature_of_flight: any
  public engine_last_start: any
  public selectedInstructor=""
  public selectedNature=""
  public selectedRunway = ""
  public isPIC = true;
  public isNightFlight = 0;
  public total_flight_time : string = ""
  public engine_end: any
  public departure_icao_code: string = "EBFS"
  public arrival_icao_code: string = "EBFS"
  public departure_time: string = '09:00'
  public arrival_time: string = '10:00'
  public number_landings_day: number = 1
  public number_landings_night: number = 1
  public oil_added_after: number = 0.00
  public oil_added_before: number = 0.00
  public fuel_added_after: number = 0
  public fuel_added_before: number = 0
  public passengers: string = ""
  public remarks: string = ""

  @ViewChild(NgxMatTimepickerComponent) picker: any


  public listColors = ['primary', 'accent', 'warn'];
  constructor(
    public dialogRef: MatDialogRef<AddFlightDialogComponent>,
    private _auth: AuthService,
    private _api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  ngOnInit(){
    this._api.getTypeRequest('user/all-instructors').subscribe((res : any) =>
    {
      this.instructors = res.data;
      for(var i = 0; i < this.instructors.length; i++){
        this.instructorsList.push(this.instructors[i].LastName + ' ' + this.instructors[i].FirstName)
      }
    });

    this._api.getTypeRequest('flights/all-runways-type').subscribe((res: any) => {
      this.type_of_runway = res.data;
      for(var i = 0; i < this.type_of_runway.length; i++){
        this.type_of_runwayList.push(this.type_of_runway[i].ShortName)
      }
    })

    this._api.getTypeRequest('flights/all-types').subscribe((res: any) => {
      this.nature_of_flight = res.data;
      for(var i = 0; i < this.nature_of_flight.length; i++){
        this.nature_of_flightsList.push(this.nature_of_flight[i].Name)
      }
    })

    this._api.getTypeRequest('flights/last-flight/' + this.data.aircraft_id).subscribe((res: any) => {
      if(res.status && res.data.length != 0){
        this.engine_last_start = res.data[0].Engine_Stop
      }
      else{
        this.engine_last_start=""
      }
    })
  }

  computeFlightTime(){
    let body = {start: this.engine_last_start, end: this.engine_end}
    this._api.postTypeRequest('flights/computeFlightTime', body).subscribe((res: any) => {
      this.total_flight_time = res.flight_time
    })

  }

  updateNightFlight(){
    if(this.isNightFlight){
      this.isNightFlight = 0
    }
    else{
      this.isNightFlight = 1
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  updatePIC(){
    if(this.isPIC){
      this.isPIC = false
    }
    else{
      this.isPIC = true
    }
  }

  sendData(){
    const instructor = this.instructors.find((instructor: { LastName: string; FirstName: string; id: any; }) =>{
        if(instructor.LastName + ' ' + instructor.FirstName === this.selectedInstructor){
          return instructor.id
        }
    })
    if(instructor != undefined){
      this.data.instructor = instructor.id
    }
    else{
      this.data.instructor = null
    }
    this.data.departure_time = this.departure_time
    this.data.arrival_time = this.arrival_time
    this.data.departure_icao_code = this.departure_icao_code
    this.data.arrival_icao_code = this.arrival_icao_code
    this.data.engine_start = this.engine_last_start
    this.data.engine_stop = this.engine_end
    this.data.engine_time = this.total_flight_time
    this.data.total_time_of_flight = this.total_flight_time

    const runway = this.type_of_runway.find((runway: { ShortName: string; id: any; }) => {
      if(runway.ShortName === this.selectedRunway){
        return runway.id
      }
    })
    this.data.type_of_runway = runway.id
    this.data.landings_number_day = this.number_landings_day
    this.data.night_flight = this.isNightFlight
    this.data.landings_number_night = this.number_landings_night

    const nature_of_flight = this.nature_of_flight.find((nature: { Name: string; id: any; }) => {
      if(nature.Name === this.selectedNature){
        return nature.id
      }
    })
    this.data.nature_of_flight = nature_of_flight.id
    this.data.oil_added_before = this.oil_added_before
    this.data.oil_added_after = this.oil_added_after
    this.data.fuel_added_before = this.fuel_added_before
    this.data.fuel_added_after = this.fuel_added_after
    this.data.passengers = this.passengers
    this.data.remarks = this.remarks


    this.dialogRef.close(this.data);
  }

  addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }
}
