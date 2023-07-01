import { Component } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DateAdapter } from 'angular-calendar';
import { ApiService } from '../services/api.service';
import { SocketService } from '../services/socket.service';

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
  selector: 'app-fuel-tank',
  templateUrl: './fuel-tank-management.component.html',
  styleUrls: ['./fuel-tank-management.component.css'],
  providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

  {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},]
})

export class FuelTankManagementComponent {
  fuelLevel: number = 0;
  fuelMeasurements: any[] = []

  newFuelMeasurement: any = {
    date: '',
    fuelLevel: 0
  };
  fuel_quantity: number = 0.0
  start_date_measure: Date = new Date()

  showAddForm = false;

  constructor(private _api: ApiService, private _socket: SocketService){

  }

  ngOnInit(): void {
    this._socket.onReloadForEveryone().subscribe((data:any) => {

      this._api.getTypeRequest('finance/all-fuel-measures').subscribe((result:any) => {
        this.fuelMeasurements = result.data
      })
      this._api.getTypeRequest('finance/last-fuel-measure').subscribe((result:any) => {
        this.fuelLevel = result.data[0].Fuel_Quantity
      })
    })
    this._api.getTypeRequest('finance/all-fuel-measures').subscribe((result:any) => {
      console.log(result)
      this.fuelMeasurements = result.data
    })
    this._api.getTypeRequest('finance/last-fuel-measure').subscribe((result:any) => {
      this.fuelLevel = result.data[0].Fuel_Quantity
    })
  }

  addNewFuelMeasurement() {
    this.newFuelMeasurement.date = this.start_date_measure
    this.newFuelMeasurement.fuelLevel = this.fuel_quantity

    console.log(this.newFuelMeasurement)
    this._api.postTypeRequest('finance/add-fuel-tank', this.newFuelMeasurement).subscribe((result:any) => {
      this._socket.reloadForEveryone()
    })
    this.showAddForm = false;
  }
  deleteFuelMeasure(currentMeasure: any){
    this._api.getTypeRequest('finance/delete-fuel-measure/' + currentMeasure.ID).subscribe((result: any) => {
      this._socket.reloadForEveryone()
    })
  }
  updateFuelLevel() {
    this.fuelLevel = Math.min(Math.max(this.fuelLevel, 0), 2000);
  }
}
