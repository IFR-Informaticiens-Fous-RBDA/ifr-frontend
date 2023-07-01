import {Component, Inject, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AircraftBookingComponent } from '../aircraft-booking/aircraft-booking.component';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';
import { FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { NgxMatTimepickerComponent } from 'ngx-mat-timepicker';
import { CurrencyPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

export interface PilotShare{
  pilot: string,
  share: number
}

export interface LandingFee {
  landing_fee_location: string,
  landing_fee_amount: number,
  landing_fee_paid: boolean
}


export interface DialogData {
  currentEvent: any
  currentUser: any
  start: any,
  end: any,
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
  landing_fee: LandingFee
  passengers: any,
  remarks: any
}


@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'add-flight-dialog.component.html',
  styleUrls: ['./add-flight-dialog.component.css'],
  providers: [CurrencyPipe]
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
  public pilotShare: number = 0
  public technical_problems: string = ""
  public total_pob = 1
  public isPIC = true;
  public hasOil = false;
  public hasFuel = false;
  public fuelInvoicePaid = false;
  public landingFeePaid = false;
  public hasLandingFee = false;
  public hasSharing = false;
  public isNightFlight = 0;
  public total_flight_time : string = ""
  public engine_end: any
  public departure_icao_code: string = "EBFS"
  public arrival_icao_code: string = "EBFS"
  public fuel_location: string="EBFS"
  public landing_fee_location: string="EBFS"
  public fuel_invoice: number = 0
  public landing_fee: LandingFee = {
    landing_fee_amount: 0.0,
    landing_fee_location: "",
    landing_fee_paid: false
  }
  public formatted_fuel_invoice!: string | null
  public formatted_landing_fee!: string | null
  public departure_time: string = ""
  public arrival_time: string = ""
  public number_landings_day: number = 1
  public number_landings_night: number = 1
  public oil_added_after: number = 0.00
  public oil_added_before: number = 0.00
  public fuel_added_after: number = 0
  public fuel_added_before: number = 0
  public passengers: string = ""
  public remarks: string = ""
  public pilotsSharingList = new MatTableDataSource<PilotShare>([])
  public displayedColumns: string[] = ['pilot', 'share', 'action']
  public filteredPilot!: Observable<string[]>;
  public selectedPilot: string = ""
  public pilotControl = new FormControl('')
  public pilotsList : string[] = []
  public pilots :any

  @ViewChild(NgxMatTimepickerComponent) picker: any


  public listColors = ['primary', 'accent', 'warn'];
  constructor(
    public dialogRef: MatDialogRef<AddFlightDialogComponent>,
    private _auth: AuthService,
    private _api: ApiService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private _currencyPipe: CurrencyPipe
  ) {
  }

  ngOnInit(){
    console.log(this.data.start)

    const utcDeparture = Date.UTC(
      this.data.start.getUTCFullYear(),
      this.data.start.getUTCMonth(),
      this.data.start.getUTCDate(),
      this.data.start.getUTCHours(),
      this.data.start.getUTCMinutes(),
      this.data.start.getUTCSeconds(),
      this.data.start.getUTCMilliseconds()
    );
    const departureDate = new Date(utcDeparture);
    const timeString_departure = departureDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', timeZone: 'UTC'});

    const [hours_departure, minutes_departure] = timeString_departure.split(':')
    this.departure_time = `${hours_departure}:${minutes_departure}`

    const utcArrival = Date.UTC(
      this.data.end.getUTCFullYear(),
      this.data.end.getUTCMonth(),
      this.data.end.getUTCDate(),
      this.data.end.getUTCHours(),
      this.data.end.getUTCMinutes(),
      this.data.end.getUTCSeconds(),
      this.data.end.getUTCMilliseconds()
    );
    const arrivalDate = new Date(utcArrival);
    const timeString_arrival = arrivalDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', timeZone: 'UTC'});
    const [hours_arrival, minutes_arrival] = timeString_arrival.split(':')
    this.arrival_time = `${hours_arrival}:${minutes_arrival}`
    this._api.getTypeRequest('user/all-members').subscribe((res: any) => {
      this.pilots = res.data
      this.pilotsList = this.pilots.map(function(pilot: { [x: string]: any; }) {
        return pilot['fullname']
      })

    })
    this.filteredPilot = this.pilotControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => value.length >= 1 ? this._filter(value || ''): []),
    );
    this.pilotsSharingList.data.push({pilot: this.data.currentUser.FirstName + " " + this.data.currentUser.LastName, share: 100})
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
        this.departure_icao_code = res.data[0].Arrival_ICAO_Code
      }
      else{
        this.engine_last_start=""
      }
    })
  }

  transformAmount(element: any){
    this.formatted_fuel_invoice = this._currencyPipe.transform(this.fuel_invoice, 'EUR');
    // Remove or comment this line if you dont want
    // to show the formatted amount in the textbox.
}

addPilotShare(pilot : any, share: any){
  this.pilotsSharingList.data = [...this.pilotsSharingList.data, {pilot: pilot, share: share}]
  this.pilotsSharingList.data[0].share = this.pilotsSharingList.data[0].share - share
}
delete(index: any){
  this.pilotsSharingList.data[0].share = this.pilotsSharingList.data[0].share + this.pilotsSharingList.data[index].share
  this.pilotsSharingList.data.splice(index, 1)
  this.pilotsSharingList.data = [...this.pilotsSharingList.data]
}

  transformAmountFee(element: any){
    const amount = this.landing_fee.landing_fee_amount.toString().replace(/[^\d.-]/g, ''); // remove any non-numeric characters

    this.formatted_landing_fee = this._currencyPipe.transform(amount, 'EUR');
  }

  private _filter(value: string) : string[] {
    const filterValue = value.toLowerCase()

    return this.pilotsList.filter(pilot => pilot.toLowerCase().includes(filterValue))
  }

  computeFlightTime(){
    let body = {start: this.engine_last_start, end: this.engine_end}
    this._api.postTypeRequest('flights/computeFlightTime', body).subscribe((res: any) => {
      this.total_flight_time = res.flight_time
    })

  }

  openConfirmationDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        message: 'Êtes-vous sûr des informations entrées ?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendData();
      }
    });
  }



  updateNightFlight(){
    if(this.isNightFlight){
      this.isNightFlight = 0
    }
    else{
      this.isNightFlight = 1
    }
  }
  updateLandingFee(){
    if(this.hasLandingFee){
      this.hasLandingFee = false
    }
    else{
      this.hasLandingFee = true
    }
  }
  updateLandingFeePaid(){
    if(this.landing_fee.landing_fee_paid){
      this.landing_fee.landing_fee_paid = false
    }
    else{
      this.landing_fee.landing_fee_paid = true
    }
  }
  updateSharingPilots(){
    if(this.hasSharing){
      this.hasSharing = false
    }
    else{
      this.hasSharing = true
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
  updateFuelInvoicePaid(){
    if(this.fuelInvoicePaid){
      this.fuelInvoicePaid = false
    }
    else{
      this.fuelInvoicePaid = true
    }
  }
  updateOil(){
    if(this.hasOil){
      this.hasOil = false
    }
    else{
      this.hasOil = true
    }
  }
  updateFuel(){
    if(this.hasFuel){
      this.hasFuel = false
    }
    else{
      this.hasFuel = true
    }
  }

  sendData(){
    console.log("je suis dans sendData")
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
    this.landing_fee.landing_fee_amount = parseFloat(this.landing_fee.landing_fee_amount.toString().replace('€', ''));
    this.data.landing_fee = this.landing_fee
    this.data.passengers = this.passengers
    this.data.remarks = this.remarks


    this.dialogRef.close(this.data);
  }

  addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }
}
