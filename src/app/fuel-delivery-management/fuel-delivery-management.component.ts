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
  selector: 'app-fuel-delivery',
  templateUrl: './fuel-delivery-management.component.html',
  styleUrls: ['./fuel-delivery-management.component.css'],
  providers: [{provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

  {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},]
})

export class FuelDeliveryManagementComponent {
  fuelDelivery: number = 0;
  fuelDeliveries: any[] = []

  newFuelDelivery: any = {
    date: '',
    fuelDelivery: 0
  };
  fuel_delivery: number = 0.0
  start_date_delivery: Date = new Date()

  showAddForm = false;

  constructor(private _api: ApiService, private _socket: SocketService){

  }

  ngOnInit(): void {
    this._socket.onReloadForEveryone().subscribe((data:any) => {

      this._api.getTypeRequest('finance/all-fuel-deliveries').subscribe((result:any) => {
        this.fuelDeliveries = result.data
      })
    })
    this._api.getTypeRequest('finance/all-fuel-deliveries').subscribe((result:any) => {
      console.log(result)
      this.fuelDeliveries = result.data
    })

  }

  addNewFuelDelivery() {
    this.newFuelDelivery.date = this.start_date_delivery
    this.newFuelDelivery.fuelDelivery = this.fuel_delivery

    console.log(this.newFuelDelivery)
    this._api.postTypeRequest('finance/add-fuel-delivery', this.newFuelDelivery).subscribe((result:any) => {
      this._socket.reloadForEveryone()
    })
    this.showAddForm = false;
  }
  deleteFuelDelivery(currentDelivery: any){
    this._api.getTypeRequest('finance/delete-fuel-delivery/' + currentDelivery.ID).subscribe((result: any) => {
      console.log(result)
      this._socket.reloadForEveryone()
    })
  }
  updateFuelDelivery() {
    this.fuelDelivery = Math.min(Math.max(this.fuelDelivery, 0), 2000);
  }
}
