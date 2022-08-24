import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddFlightDialogComponent } from '../add-flight-dialog/add-flight-dialog.component';
import { ApiService } from '../services/api.service';
import { SocketService } from '../services/socket.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';


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
  VOForm!: FormGroup;
  isEditableNew: boolean = true;
  displayedColumns : string[] = ['Registration','Date_Of_Flight', 'Departure_ICAO_Code', 'Departure_Time', 'Arrival_ICAO_Code', 'Arrival_Time', 'Total_Time_Of_Flight', 'FirstName', 'LastName', 'ShortName', 'Landings_Number_Day', 'Name', 'Engine_Start', 'Engine_Stop', 'Engine_Time', 'action']
  dataSource = new MatTableDataSource<any>()

  @ViewChild('paginator') paginator!: MatPaginator;


  constructor(private _api: ApiService, private _socket: SocketService, public dialog: MatDialog, private fb: FormBuilder, private _formBuilder: FormBuilder) { }

  ngOnInit(): void {

    this.VOForm = this._formBuilder.group({
      VORows: this._formBuilder.array([])
    })

    this._api.getTypeRequest('flights/flights-management').subscribe((result: any) => {
      this.allFlights = result.data

      this.VOForm = this.fb.group({
        VORows: this.fb.array(this.allFlights.map((val: { ID: any; Registration: any; Date_Of_Flight: any; Departure_ICAO_Code: any; Departure_Time: any; Arrival_ICAO_Code: any; Arrival_Time: any; Total_Time_Of_Flight: any; FirstName: any; LastName: any; ShortName: any; Landings_Number_Day: any; Name: any; Engine_Start: any; Engine_Stop: any; Engine_Time: any; }) => this.fb.group({
          id: val.ID,
          position: new FormControl(this.allFlights.indexOf(val) + 1),
          registration: new FormControl(val.Registration),
          date_of_flight: new FormControl(val.Date_Of_Flight),
          departure_icao_code: new FormControl(val.Departure_ICAO_Code),
          departure_time: new FormControl(val.Departure_Time),
          arrival_icao_code: new FormControl(val.Arrival_ICAO_Code),
          arrival_time: new FormControl(val.Arrival_Time),
          total_time_of_flight: new FormControl(val.Total_Time_Of_Flight),
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
    console.log(VOFormElement.get('VORows').at(i))
    // this.isEditableNew = true;

  }

  // On click of correct button in table (after click on edit) this method will call
  SaveVO(VOFormElement: { get: (arg0: string) => { (): any; new(): any; at: { (arg0: any): { (): any; new(): any; get: { (arg0: string): { (): any; new(): any; patchValue: { (arg0: boolean): void; new(): any; }; }; new(): any; }; }; new(): any; }; }; }, i: any) {
    // alert('SaveVO')
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(true);
    console.log("new value")
    console.log(VOFormElement.get('VORows').at(i))

  }

  // On click of cancel button in the table (after click on edit) this method will call and reset the previous data
  CancelSVO(VOFormElement: { get: (arg0: string) => { (): any; new(): any; at: { (arg0: any): { (): any; new(): any; get: { (arg0: string): { (): any; new(): any; patchValue: { (arg0: boolean): void; new(): any; }; }; new(): any; }; }; new(): any; }; }; }, i: any) {
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(true);
  }

  exportExcel(): void{
    let element = document.getElementById('excel-table')
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    XLSX.writeFile(wb, this.fileName)
  }

  applyFilter(event: Event) {
    //  debugger;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
