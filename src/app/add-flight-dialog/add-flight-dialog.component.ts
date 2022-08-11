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
  slot: any,
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
  public type_of_runway: any
  public nature_of_flight: any
  public selectedInstructor=""
  public isPIC = false;
  @ViewChild(NgxMatTimepickerComponent) picker: any


  public listColors = ['primary', 'accent', 'warn'];
  constructor(
    public dialogRef: MatDialogRef<AddFlightDialogComponent>,
    private _auth: AuthService,
    private _api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  ngOnInit(){
    console.log("coucoucou")
    this._api.getTypeRequest('user/all-instructors').subscribe((res : any) =>
    {
      this.instructors = res.data;
      for(var i = 0; i < this.instructors.length; i++){
        this.instructorsList.push(this.instructors[i].LastName + ' ' + this.instructors[i].FirstName)
      }
      console.log(this.instructors)
    });

    this._api.getTypeRequest('flights/all-runways-type').subscribe((res: any) => {
      this.type_of_runway = res.data;
      console.log(this.type_of_runway)
    })

    this._api.getTypeRequest('flights/all-types').subscribe((res: any) => {
      this.nature_of_flight = res.data;
      console.log(this.nature_of_flight)
    })
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


    this.dialogRef.close(this.data);
  }

  addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }
}
