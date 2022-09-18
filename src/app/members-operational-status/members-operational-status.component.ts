import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddFlightDialogComponent } from '../add-flight-dialog/add-flight-dialog.component';
import { ApiService } from '../services/api.service';
import { SocketService } from '../services/socket.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

export interface MembersOperationalStatus{
  FirstName: string,
  LastName: string,
  License_validity: Date | null,
  Sep_validity: Date | null,
  Medical_class_validity: Date | null,
  Bq_qual: Date | null,
  Bq_date: Date | null,
  Bi_qual: Date | null,
  Bi_date: Date | null,
  Bu_qual: Date | null,
  Bu_date: Date | null
  By_qual: Date | null,
  By_date: Date | null,
  Special_decision_end: Date | null
}
@Component({
  selector: 'app-flights',
  templateUrl: './members-operational-status.component.html',
  styleUrls: ['./members-operational-status.component.css']
})
export class MembersOperationalStatusComponent implements OnInit, AfterViewInit {
  currentUser: any;
  pageNumber: number = 1;
  fileName = 'ExcelSheet.xlsx'
  all_members_operational_status! :MembersOperationalStatus[]
  VOForm!: FormGroup;
  isEditableNew: boolean = true;
  displayedColumns : string[] = ['position', 'FirstName', 'LastName', 'License_validity', 'Sep_validity', 'Medical_class_validity', 'Bq_qual', 'Bq_date', 'Bi_qual', 'Bi_date', 'Bu_qual', 'Bu_date','By_qual', 'By_date', 'Special_decision_end', 'action']
  dataSource = new MatTableDataSource<any>()
  editClicked = false;

  @ViewChild('paginator') paginator!: MatPaginator;


  constructor(private _api: ApiService, private _socket: SocketService, public dialog: MatDialog, private fb: FormBuilder, private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('userData') || '{}');

    this.VOForm = this._formBuilder.group({
      VORows: this._formBuilder.array([])
    })

    this._api.getTypeRequest('user/all-members-operational-status/' + this.currentUser[0].id).subscribe((result: any) => {
      this.all_members_operational_status = result.data
      console.log(result.data)

      this.VOForm = this.fb.group({
        VORows: this.fb.array(this.all_members_operational_status.map((val: MembersOperationalStatus) => this.fb.group({
          position: new FormControl(this.all_members_operational_status.indexOf(val) + 1),
          FirstName: new FormControl(val.FirstName),
          LastName: new FormControl(val.LastName),
          License_validity: new FormControl(val.License_validity),
          Sep_validity: new FormControl(val.Sep_validity),
          Medical_class_validity: new FormControl(val.Medical_class_validity),
          Bq_qual: new FormControl(val.Bq_qual),
          Bq_date: new FormControl(val.Bq_date),
          Bi_qual: new FormControl(val.Bi_qual),
          Bi_date: new FormControl(val.Bi_date),
          Bu_qual: new FormControl(val.Bu_qual),
          Bu_date: new FormControl(val.Bu_date),
          By_qual: new FormControl(val.By_qual),
          By_date: new FormControl(val.By_date),
          Special_decision_end: new FormControl(val.Special_decision_end),
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
    this.editClicked = true
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
