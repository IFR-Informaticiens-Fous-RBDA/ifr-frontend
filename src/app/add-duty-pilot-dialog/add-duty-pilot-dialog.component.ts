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
  slot: Date;
  delete: boolean
}


@Component({
  selector: 'app-add-duty-pilot-dialog',
  templateUrl: './add-duty-pilot-dialog.component.html',
  styleUrls: ['./add-duty-pilot-dialog.component.css']
})
export class AddDutyPilotDialogComponent{

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
  public enableMeridian = false;
  public minDate: moment.Moment | undefined;
  public maxDate: moment.Moment | undefined;
  public stepHour = 1;
  public stepMinute = 10;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';
  public faTrash = faTrash;

  public formGroup = new UntypedFormGroup({
    date: new UntypedFormControl(null, [Validators.required]),
    date2: new UntypedFormControl(null, [Validators.required])
  })
  public startDate: Date
  public endDate: Date
  public dateControlStart : UntypedFormControl;
  public dateControlEnd : UntypedFormControl;

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
    public dialogRef: MatDialogRef<DutyPilotBookingComponent>,
    private _auth: AuthService,
    private _api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.startDate = new Date()
    this.startDate.setDate(this.data.slot.getDate())
    this.startDate.setHours(9, 0, 0)
    this.endDate = new Date()
    this.endDate.setDate(this.data.slot.getDate())
    this.endDate.setHours(18, 0, 0)


    this.dateControlStart = new UntypedFormControl(this.startDate)
    this.dateControlEnd = new UntypedFormControl(this.endDate)
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  sendData(){
    this.data.start = this.dateControlStart.value
    this.data.end = this.dateControlEnd.value
    this.dialogRef.close(this.data)
  }

  deleteDutyPilot(){
    this.data.delete = true;
    this.dialogRef.close(this.data)
  }

  addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }
}
