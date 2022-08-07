import {Component, Inject, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AircraftBookingComponent } from '../aircraft-booking/aircraft-booking.component';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';


export interface DialogData {
  slot: Date,
  start: Date,
  end: Date,
  user: any,
  aircraft: Aircraft,
  description: string,
  delete: boolean
}
interface Color {
  primary: string,
  secondary: string
}
interface Aircraft {
  value: string;
  viewValue: string;
  color: Color;
}
@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'update-event.component.html',
})
export class UpdateEventComponent {
  constructor(
    public dialogRef: MatDialogRef<UpdateEventComponent>,
    private _auth: AuthService,
    private _api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  ngOnInit(){
    this._api.getTypeRequest('aircraft/all').subscribe((res : any) =>
    {
      this.aircrafts = res.data;
    });
  }
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
  public dateControlStart = new UntypedFormControl(this.data.slot);
  public dateControlEnd = new UntypedFormControl(this.addHoursToDate(this.data.slot, 1));

  public dateControlMinMax = new UntypedFormControl(new Date());

  public options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' }
  ];

  public listColors = ['primary', 'accent', 'warn'];

  public stepHours = [1, 2, 3, 4, 5];
  public stepMinutes = [1, 5, 10, 15, 20, 25];
  public stepSeconds = [1, 5, 10, 15, 20, 25];
  public aircrafts: any;

  onNoClick(): void {
    this.dialogRef.close();
  }

  sendData(){
    this.data.aircraft = this.aircrafts.find((aircraft: { registration: string; }) => aircraft.registration == this.selectedAircraft)!
    this.data.description = this.description
    this.data.user = this._auth.getUserDetails()
    this.data.start = this.dateControlStart.value
    this.data.end = this.dateControlEnd.value
    this.data.delete = false

    this.dialogRef.close(this.data);
  }
  deleteEvent(){
    this.data.delete = true;
    this.dialogRef.close(this.data)
  }

  addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }
}
