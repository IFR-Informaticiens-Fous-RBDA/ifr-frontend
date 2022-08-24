import {Component, Inject, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AircraftBookingComponent } from '../aircraft-booking/aircraft-booking.component';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { faTrash } from '@fortawesome/free-solid-svg-icons';



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
  templateUrl: 'show-event-dialog.component.html',
})
export class ShowEventDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ShowEventDialogComponent>,
    private _auth: AuthService,
    private _api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(){
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  sendData(){
    this.dialogRef.close();
  }

}
