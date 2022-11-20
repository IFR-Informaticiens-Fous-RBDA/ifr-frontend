import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { DutyPilotBookingComponent } from '../duty-pilot-booking/duty-pilot-booking.component';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';

export interface DialogData {
  user: any;
  start: Date;
  end: Date;
  recurringDates: any | undefined;
  delete: boolean
  isDoublePilotService: boolean
}


@Component({
  selector: 'app-add-duty-pilot-needed-dialog',
  templateUrl: './add-duty-pilot-needed-dialog.component.html',
  styleUrls: ['./add-duty-pilot-needed-dialog.component.css']
})
export class AddDutyPilotNeededDialogComponent{

  @ViewChild('picker') picker: any;
  @ViewChild('picker') picker2: any;
  public date: moment.Moment | undefined;
  public disabled = false;
  public selectedAircraft = "";
  public showSpinners = true;
  public showSeconds = false;
  public name = "";
  public description = "";
  public touchUi = false;
  public isDoublePilotService = false;
  public enableMeridian = false;
  public minDate: moment.Moment | undefined;
  public maxDate: moment.Moment | undefined;
  public stepHour = 1;
  public stepMinute = 10;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';
  public faTrash = faTrash;
  public doesRepeat = false;
  public recurringDates : any

  public formGroup = new UntypedFormGroup({
    date: new UntypedFormControl(null, [Validators.required]),
    date2: new UntypedFormControl(null, [Validators.required])
  })
  public startDate: Date
  public endDate: Date
  public dateControlStart : UntypedFormControl;
  public dateControlEnd : UntypedFormControl;
  public currentUser: any

  public dateControlMinMax = new UntypedFormControl(new Date());

  public options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' }
  ];

  public listColors = ['primary', 'accent', 'warn'];

  public stepHours = [1, 2, 3, 4, 5];
  public stepMinutes = [1, 5, 10, 15, 20, 25];
  public stepSeconds = [1, 5, 10, 15, 20, 25];

  constructor(
    public dialogRef: MatDialogRef<AddDutyPilotNeededDialogComponent>,
    private _auth: AuthService,
    private _api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.startDate = new Date()
    this.startDate.setHours(8, 0, 0)
    this.endDate = new Date()
    this.endDate.setHours(9, 0, 0)


    this.dateControlStart = new UntypedFormControl(this.startDate)
    this.dateControlEnd = new UntypedFormControl(this.endDate)
  }

  ngOnInit(): void {
    this._auth.getUserDetails().then(currentUser => {
      this.currentUser = currentUser
    })

  }

  updateDoublePilotService(){
    if(this.isDoublePilotService){
      this.isDoublePilotService = false
    }
    else{
      this.isDoublePilotService = true
    }
  }
  changeEndHour(){
    console.log("coucou")
    this.endDate = new Date(this.dateControlStart.value.getTime())
    this.endDate.setHours(9,0,0)
    this.dateControlEnd = new UntypedFormControl(this.endDate)

  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  sendData(){
    this.data.user = this.currentUser[0]
    this.data.start = this.dateControlStart.value
    this.data.end = this.dateControlEnd.value
    this.data.recurringDates = this.recurringDates
    this.data.isDoublePilotService = this.isDoublePilotService

    this.dialogRef.close(this.data)
  }

  childChange(value: any){
    this.recurringDates = value
  }

  repeatReservation(){

    if(this.doesRepeat){
      this.doesRepeat = false
    }
    else{
      this.doesRepeat = true
    }
  }

  deleteDutyPilot(){
    this.data.delete = true;
    this.dialogRef.close(this.data)
  }

  addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }
}
