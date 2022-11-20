import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddFlightDialogComponent } from '../add-flight-dialog/add-flight-dialog.component';
import { ApiService } from '../services/api.service';
import { SocketService } from '../services/socket.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TableUtil } from "./tableUtil";

import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../services/auth.service';

export interface FlightLogRowToSend{
  id: number,
  aircraft_id: string,
  date_of_flight: Date,
  departure_icao_code: string,
  departure_time: string,
  arrival_icao_code: string,
  arrival_time: string,
  total_time_of_flight: string,
  pilot_id: number,
  instructor_id: number,
  landings_type_of_runway_id: number,
  landings_number_day: number,
  night_flight: boolean,
  landings_number_night: number,
  nature_of_flight_id: number,
  engine_start: string,
  engine_stop: string,
  engine_time: string,
  oil_added_before: number,
  oil_added_after: number,
  fuel_added_before: number,
  fuel_added_after: number,
  passengers: string,
  remarks: string,



}
@Component({
  selector: 'app-flights',
  templateUrl: './flights-management.component.html',
  styleUrls: ['./flights-management.component.css']
})
export class FlightsManagementComponent implements OnInit, AfterViewInit {
  currentUser: any;
  pageNumber: number = 1;
  fileName = 'ExcelSheet.xlsx'
  allFlights :any
  data_to_send: FlightLogRowToSend = {
    id: 99,
    aircraft_id: "",
    date_of_flight: new Date(),
    departure_icao_code: "",
    departure_time: "",
    arrival_icao_code: "",
    arrival_time: "",
    total_time_of_flight: "",
    pilot_id: 99,
    instructor_id: 99,
    landings_type_of_runway_id: 99,
    landings_number_day: 0,
    night_flight: false,
    landings_number_night: 0,
    nature_of_flight_id: 99,
    engine_start: "",
    engine_stop: "",
    engine_time: "",
    oil_added_before: 0,
    oil_added_after: 0,
    fuel_added_before: 0,
    fuel_added_after: 0,
    passengers: "",
    remarks: "",
  }
  VOForm!: FormGroup;
  isEditableNew: boolean = true;
  displayedColumns : string[] = ['position','Registration','Date_Of_Flight', 'Departure_ICAO_Code', 'Departure_Time', 'Arrival_ICAO_Code', 'Arrival_Time', 'Total_Time_Of_Flight', 'PilotFirstName', 'PilotLastName','FirstName', 'LastName', 'ShortName', 'Landings_Number_Day', 'Name', 'Engine_Start', 'Engine_Stop', 'Engine_Time', 'action']
  dataSource = new MatTableDataSource<any>()

  @ViewChild('paginator') paginator!: MatPaginator;


  constructor(private _api: ApiService, private _socket: SocketService, public dialog: MatDialog, private fb: FormBuilder, private _formBuilder: FormBuilder, private _auth: AuthService) { }

  ngOnInit(): void {
    this.VOForm = this._formBuilder.group({
      VORows: this._formBuilder.array([])
    })

    this._socket.onReloadForEveryone().subscribe((data: any) => {
      this._api.getTypeRequest('user/member-id/' + this.currentUser[0].id).subscribe((res: any) => {
      this.currentUser[0].member_id = res.data[0].ID_Member
        this._api.postTypeRequest('flights/flights-management', this.currentUser).subscribe((result: any) => {
          this.allFlights = result.data

          this.VOForm = this.fb.group({
            VORows: this.fb.array(this.allFlights.map((val: { ID: any; Registration: any; Date_Of_Flight: any; Departure_ICAO_Code: any; Departure_Time: any; Arrival_ICAO_Code: any; Arrival_Time: any; Total_Time_Of_Flight: any; FirstName: any; LastName: any; PilotFirstName: any; PilotLastName: any; ShortName: any; Landings_Number_Day: any; Name: any; Engine_Start: any; Engine_Stop: any; Engine_Time: any; }) => this.fb.group({
              id: val.ID,
              position: new FormControl(this.allFlights.indexOf(val) + 1),
              registration: new FormControl(val.Registration),
              date_of_flight: new FormControl(val.Date_Of_Flight),
              departure_icao_code: new FormControl(val.Departure_ICAO_Code),
              departure_time: new FormControl(val.Departure_Time),
              arrival_icao_code: new FormControl(val.Arrival_ICAO_Code),
              arrival_time: new FormControl(val.Arrival_Time),
              total_time_of_flight: new FormControl(val.Total_Time_Of_Flight),
              pilot_first_name: new FormControl(val.PilotFirstName),
              pilot_last_name: new FormControl(val.PilotLastName),
              instructor_first_name: new FormControl(val.FirstName),
              instructor_last_name: new FormControl(val.LastName),
              type_of_runway: new FormControl(val.ShortName),
              landings_number_day: new FormControl(val.Landings_Number_Day),
              nature_of_flight: new FormControl(val.Name),
              engine_start: new FormControl(val.Engine_Start),
              engine_stop: new FormControl(val.Engine_Stop),
              engine_time: new FormControl(val.Engine_Time),
              isEditable: new FormControl(true),
              isNewRow: new FormControl(false)

            })))
          })

          this.dataSource = new MatTableDataSource((this.VOForm.get('VORows') as FormArray).controls)
          this.dataSource.paginator = this.paginator
          const filterPredicate = this.dataSource.filterPredicate;
          this.dataSource.filterPredicate = (data: AbstractControl, filter) => {
            return filterPredicate.call(this.dataSource, data.value, filter);
          }

        })
      })
    })
    this._auth.getUserDetails().then(currentUser => {
      this.currentUser = currentUser


      this._api.getTypeRequest('user/member-id/' + this.currentUser[0].id).subscribe((res: any) => {
        this.currentUser[0].member_id = res.data[0].ID_Member
          this._api.postTypeRequest('flights/flights-management', this.currentUser).subscribe((result: any) => {
            this.allFlights = result.data

            this.VOForm = this.fb.group({
              VORows: this.fb.array(this.allFlights.map((val: { ID: any; Registration: any; Date_Of_Flight: any; Departure_ICAO_Code: any; Departure_Time: any; Arrival_ICAO_Code: any; Arrival_Time: any; Total_Time_Of_Flight: any; FirstName: any; LastName: any; PilotFirstName: any; PilotLastName: any; ShortName: any; Landings_Number_Day: any; Name: any; Engine_Start: any; Engine_Stop: any; Engine_Time: any; }) => this.fb.group({
                id: val.ID,
                position: new FormControl(this.allFlights.indexOf(val) + 1),
                registration: new FormControl(val.Registration),
                date_of_flight: new FormControl(val.Date_Of_Flight),
                departure_icao_code: new FormControl(val.Departure_ICAO_Code),
                departure_time: new FormControl(val.Departure_Time),
                arrival_icao_code: new FormControl(val.Arrival_ICAO_Code),
                arrival_time: new FormControl(val.Arrival_Time),
                total_time_of_flight: new FormControl(val.Total_Time_Of_Flight),
                pilot_first_name: new FormControl(val.PilotFirstName),
                pilot_last_name: new FormControl(val.PilotLastName),
                instructor_first_name: new FormControl(val.FirstName),
                instructor_last_name: new FormControl(val.LastName),
                type_of_runway: new FormControl(val.ShortName),
                landings_number_day: new FormControl(val.Landings_Number_Day),
                nature_of_flight: new FormControl(val.Name),
                engine_start: new FormControl(val.Engine_Start),
                engine_stop: new FormControl(val.Engine_Stop),
                engine_time: new FormControl(val.Engine_Time),
                isEditable: new FormControl(true),
                isNewRow: new FormControl(false)

              })))
            })

            this.dataSource = new MatTableDataSource((this.VOForm.get('VORows') as FormArray).controls)
            this.dataSource.paginator = this.paginator
            const filterPredicate = this.dataSource.filterPredicate;
            this.dataSource.filterPredicate = (data: AbstractControl, filter) => {
              return filterPredicate.call(this.dataSource, data.value, filter);
            }

          })
        })
      })




  }

  ngAfterViewInit(){
    this.dataSource.paginator = this.paginator;
    this.paginatorList = document.getElementsByClassName('mat-paginator-range-label');

   this.onPaginateChange(this.paginator, this.paginatorList);

   this.paginator.page.subscribe(() => { // this is page change event
     this.onPaginateChange(this.paginator, this.paginatorList);
   });
  }

  paginatorList!: HTMLCollectionOf<Element>;
  idx!: number;
  onPaginateChange(paginator: MatPaginator, list: HTMLCollectionOf<Element>) {
      setTimeout((idx: any) => {
          let from = (paginator.pageSize * paginator.pageIndex) + 1;

          let to = (paginator.length < paginator.pageSize * (paginator.pageIndex + 1))
              ? paginator.length
              : paginator.pageSize * (paginator.pageIndex + 1);

          let toFrom = (paginator.length == 0) ? 0 : `${from} - ${to}`;
          let pageNumber = (paginator.length == 0) ? `0 of 0` : `${paginator.pageIndex + 1} of ${paginator.getNumberOfPages()}`;
          let rows = `Page ${pageNumber} (${toFrom} of ${paginator.length})`;

          if (list.length >= 1)
              list[0].innerHTML = rows;

      }, 0, paginator.pageIndex);
  }
  goToPage() {
    this.paginator.pageIndex = this.pageNumber - 1;
    this.paginator.page.next({
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      length: this.paginator.length
    });
  }

  EditSVO(VOFormElement: { get: (arg0: string) => { (): any; new(): any; at: { (arg0: any): { (): any; new(): any; get: { (arg0: string): { (): any; new(): any; patchValue: { (arg0: boolean): void; new(): any; }; }; new(): any; }; }; new(): any; }; }; }, i: any) {

    // VOFormElement.get('VORows').at(i).get('name').disabled(false)
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(false);
    // this.isEditableNew = true;

  }

  // On click of correct button in table (after click on edit) this method will call
  async SaveVO(VOFormElement: { get: (arg0: string) => { (): any; new(): any; at: { (arg0: any): {
    value: any; (): any; new(): any; get: { (arg0: string): { (): any; new(): any; patchValue: { (arg0: boolean): void; new(): any; }; }; new(): any; };
}; new(): any; }; }; }, i: any) {
    // alert('SaveVO')
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(true);

    let instructor_member_id:any
    let instructor_id:any

    let aircraft_id: any = await this._api.getTypeRequest('aircraft/aircraft-id-by-name/' + VOFormElement.get('VORows').at(i).value.registration).toPromise() //aicraft[0]
    let pilot_member_id: any = await this._api.getTypeRequest('user/member-by-name/' + VOFormElement.get('VORows').at(i).value.pilot_last_name + '/' + VOFormElement.get('VORows').at(i).value.pilot_first_name).toPromise()
    let pilot_id: any = await this._api.getTypeRequest('user/account-id/' + pilot_member_id.data[0].ID).toPromise()
    if(VOFormElement.get('VORows').at(i).value.instructor_last_name != ""){
      instructor_member_id = await this._api.getTypeRequest('user/member-by-name/' + VOFormElement.get('VORows').at(i).value.instructor_last_name + '/' + VOFormElement.get('VORows').at(i).value.instructor_first_name).toPromise()
      instructor_id = await this._api.getTypeRequest('user/account-id/' + instructor_member_id.data[0].ID).toPromise()
    }

    else{
      instructor_id = null
    }
    let landings_type_of_runway_id: any = await this._api.getTypeRequest('flights/runway-type-id-by-name/' + VOFormElement.get('VORows').at(i).value.type_of_runway).toPromise()
    let nature_of_flight_id: any = await this._api.getTypeRequest('flights/flight-nature-id-by-name/' + VOFormElement.get('VORows').at(i).value.nature_of_flight).toPromise()

    this.data_to_send.aircraft_id = aircraft_id[0]
    this.data_to_send.arrival_icao_code = VOFormElement.get('VORows').at(i).value.arrival_icao_code
    this.data_to_send.arrival_time = VOFormElement.get('VORows').at(i).value.arrival_time
    this.data_to_send.date_of_flight = VOFormElement.get('VORows').at(i).value.date_of_flight
    this.data_to_send.departure_icao_code = VOFormElement.get('VORows').at(i).value.departure_icao_code
    this.data_to_send.departure_time = VOFormElement.get('VORows').at(i).value.departure_time
    this.data_to_send.engine_start = VOFormElement.get('VORows').at(i).value.engine_start
    this.data_to_send.engine_stop = VOFormElement.get('VORows').at(i).value.engine_stop
    this.data_to_send.engine_time = VOFormElement.get('VORows').at(i).value.engine_time
    //this.data_to_send.fuel_added_after =
    this.data_to_send.id = VOFormElement.get('VORows').at(i).value.id
    this.data_to_send.instructor_id = instructor_id != null ? instructor_id.data[0].ID : null
    this.data_to_send.landings_number_day = VOFormElement.get('VORows').at(i).value.landings_number_day
    this.data_to_send.landings_type_of_runway_id = landings_type_of_runway_id.data[0].ID
    this.data_to_send.nature_of_flight_id = nature_of_flight_id.data[0].ID
    this.data_to_send.pilot_id = pilot_id.data[0].ID
    this.data_to_send.total_time_of_flight = VOFormElement.get('VORows').at(i).value.total_time_of_flight

    let update_result = await this._api.postTypeRequest('flights/update-flight-management', this.data_to_send).toPromise()
    this._socket.reloadForEveryone()

  }

  async DeleteSVO(VOFormElement: { get: (arg0: string) => { (): any; new(): any; at: { (arg0: any): {
    value: any; (): any; new(): any; get: { (arg0: string): { (): any; new(): any; patchValue: { (arg0: boolean): void; new(): any; }; }; new(): any; };
}; new(): any; }; }; }, i: any){
  let delete_result = await this._api.getTypeRequest('flights/delete-flight-log-management/' + VOFormElement.get('VORows').at(i).value.id).toPromise()
  this._socket.reloadForEveryone()

}

  // On click of cancel button in the table (after click on edit) this method will call and reset the previous data
  CancelSVO(VOFormElement: { get: (arg0: string) => { (): any; new(): any; at: { (arg0: any): { (): any; new(): any; get: { (arg0: string): { (): any; new(): any; patchValue: { (arg0: boolean): void; new(): any; }; }; new(): any; }; }; new(): any; }; }; }, i: any) {
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(true);
  }

  exportTable() {
    TableUtil.exportTableToExcel("ExampleMaterialTable");
  }

  exportNormalTable() {
    TableUtil.exportTableToExcel("ExampleNormalTable");
  }

  exportExcel() {
    const data = []
    for(let i = 0; i < this.dataSource.filteredData.length; i++){
      data.push(this.dataSource.filteredData[i].value)
    }
    const copy = JSON.parse(JSON.stringify(data)) as typeof data // deep copy because it also changed the data source values.
    copy.forEach(function(v){delete v.id; delete v.isNewRow; delete v.isEditable})
    TableUtil.exportArrayToExcel(copy, "rbda_flight_log");
  }

  applyFilter(event: Event) {
    //  debugger;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
