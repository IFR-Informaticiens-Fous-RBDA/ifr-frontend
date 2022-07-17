import {Component, Inject, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AircraftBookingComponent } from '../aircraft-booking/aircraft-booking.component';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';


export interface DialogData {
  slot: Date,
  start: Date,
  end: Date,
  description: string,
  aircraft: Aircraft
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
  templateUrl: 'add-event-dialog.component.html',
})
export class AddEventDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AddEventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  @ViewChild('picker') picker: any;
  @ViewChild('picker') picker2: any;
  public date: moment.Moment | undefined;
  public disabled = false;
  public selectedAircraft = "";
  public showSpinners = true;
  public showSeconds = false;
  public name = "";
  public touchUi = false;
  public enableMeridian = false;
  public minDate: moment.Moment | undefined;
  public maxDate: moment.Moment | undefined;
  public stepHour = 1;
  public stepMinute = 10;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';

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
  aircrafts: Aircraft[] = [
    {value: 'OO-HBI', viewValue: 'OO-HBI',
      color:{
        primary: '#FAE3E3',
        secondary: '#F9D923',
      }
    },
    {value: 'OO-HBU', viewValue: 'OO-HBU',
      color:{
        primary: '#FAE3E3',
        secondary: '#AB46D2',
      }
    },
    {value: 'OO-HBY', viewValue: 'OO-HBY',
      color:{
        primary: '#FAE3E3',
        secondary: '#36AE7C',
      }
    },
    {value: 'OO-HBQ', viewValue: 'OO-HBQ',
      color:{
        primary: '#FAE3E3',
        secondary: '#187498',
      }
    }
  ];

  onNoClick(): void {
    this.dialogRef.close();
  }

  sendData(){
    this.data.aircraft = this.aircrafts.find(aircraft => aircraft.value == this.selectedAircraft)!
    console.log(this.data.aircraft)
    this.data.description = this.name
    this.data.start = this.dateControlStart.value
    this.data.end = this.dateControlEnd.value
    this.dialogRef.close(this.data);
  }

  addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }
}
