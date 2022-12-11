import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddFlightDialogComponent } from '../add-flight-dialog/add-flight-dialog.component';
import { ApiService } from '../services/api.service';
import { SocketService } from '../services/socket.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TableUtil } from '../flights-management/tableUtil';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';


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
export interface MemberDataToSend{
  member_id: number,
  Bi_qual: Date | null,
  Bu_qual: Date | null,
  By_qual: Date | null,
  Bq_qual: Date | null,
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
  data_to_send: MemberDataToSend = {
    member_id: 0,
    Bi_qual: null,
    Bu_qual: null,
    By_qual: null,
    Bq_qual: null,
    Special_decision_end: null
  }
  all_members_operational_status! :MembersOperationalStatus[]
  VOForm!: FormGroup;
  isEditableNew: boolean = true;
  displayedColumns : string[] = ['position', 'FirstName', 'LastName', 'License_validity', 'Sep_validity', 'Medical_class_validity', 'Bq_qual', 'Bq_date', 'Bi_qual', 'Bi_date', 'Bu_qual', 'Bu_date','By_qual', 'By_date', 'Special_decision_end', 'action']
  dataSource = new MatTableDataSource<any>()
  editClicked = false;

  @ViewChild('paginator') paginator!: MatPaginator;


  constructor(private _api: ApiService, private _socket: SocketService, public dialog: MatDialog, private fb: FormBuilder, private _formBuilder: FormBuilder, private spinner: NgxSpinnerService, private _auth: AuthService) { }

  ngOnInit(): void {
    this.spinner.show()
    this.VOForm = this._formBuilder.group({
      VORows: this._formBuilder.array([])
    })

    this._socket.onReloadForEveryone().subscribe((data: any) => {
      this._api.getTypeRequest('user/all-members-operational-status/' + this.currentUser[0].id).subscribe((result: any) => {
        this.all_members_operational_status = result.data
        this.VOForm = this.fb.group({
          VORows: this.fb.array(this.all_members_operational_status.map((val: MembersOperationalStatus) => this.fb.group({
            position: new FormControl(this.all_members_operational_status.indexOf(val) + 1),
            FirstName: new FormControl(val.FirstName),
            LastName: new FormControl(val.LastName),
            License_validity: new FormControl(val.License_validity),
            color_License_validity: val.License_validity !== null || new Date(val.License_validity!).getTime() > new Date().getTime() ? 'white' : 'red',
            Sep_validity: new FormControl(val.Sep_validity),
            color_Sep_validity: val.Sep_validity !== null || new Date(val.Sep_validity!).getTime() > new Date().getTime() ? 'white' : 'red',
            Medical_class_validity: new FormControl(val.Medical_class_validity),
            color_Medical_class_validity: val.Medical_class_validity !== null || new Date(val.Medical_class_validity!).getTime() > new Date().getTime() ? 'white' : 'red',
            Bq_qual: new FormControl(val.Bq_qual),
            color_Bq_qual: val.Bq_qual !== null ? 'white' : 'red',
            Bq_date: new FormControl(val.Bq_date),
            color_Bq_date: val.Bq_date === null || Date.now() < new Date(val.Bq_date!).getTime() + 7889400000 ? 'white' : 'red',
            Bi_qual: new FormControl(val.Bi_qual),
            color_Bi_qual: val.Bi_qual !== null ? 'white' : 'red',
            Bi_date: new FormControl(val.Bi_date),
            color_Bi_date: val.Bi_date === null || Date.now() < new Date(val.Bi_date!).getTime() + 7889400000 ? 'white' : 'red',
            Bu_qual: new FormControl(val.Bu_qual),
            color_Bu_qual: val.Bu_qual !== null ? 'white' : 'red',
            Bu_date: new FormControl(val.Bu_date),
            color_Bu_date: val.Bu_date === null || Date.now() < new Date(val.Bu_date!).getTime() + 7889400000 ? 'white' : 'red',
            By_qual: new FormControl(val.By_qual),
            color_By_qual: val.By_qual !== null ? 'white' : 'red',
            By_date: new FormControl(val.By_date),
            color_By_date: val.By_date === null || Date.now() < new Date(val.By_date!).getTime() + 7889400000 ? 'white' : 'red',
            Special_decision_end: new FormControl(val.Special_decision_end),
            color_Special_decision_end: val.Special_decision_end === null || new Date(val.Special_decision_end!).getTime() < new Date().getTime() ? 'white' : 'red',
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
        this.spinner.hide()
      })

    })

    this._auth.getUserDetails().then(currentUser => {
      this.currentUser = currentUser



      this._api.getTypeRequest('user/all-members-operational-status/' + this.currentUser[0].id).subscribe((result: any) => {
        this.all_members_operational_status = result.data
        this.VOForm = this.fb.group({
          VORows: this.fb.array(this.all_members_operational_status.map((val: MembersOperationalStatus) => this.fb.group({
            position: new FormControl(this.all_members_operational_status.indexOf(val) + 1),
            FirstName: new FormControl(val.FirstName),
            LastName: new FormControl(val.LastName),
            License_validity: new FormControl(val.License_validity),
            color_License_validity: val.License_validity !== null || new Date(val.License_validity!).getTime() > new Date().getTime() ? 'white' : 'red',
            Sep_validity: new FormControl(val.Sep_validity),
            color_Sep_validity: val.Sep_validity !== null || new Date(val.Sep_validity!).getTime() > new Date().getTime() ? 'white' : 'red',
            Medical_class_validity: new FormControl(val.Medical_class_validity),
            color_Medical_class_validity: val.Medical_class_validity !== null || new Date(val.Medical_class_validity!).getTime() > new Date().getTime() ? 'white' : 'red',
            Bq_qual: new FormControl(val.Bq_qual),
            color_Bq_qual: val.Bq_qual !== null ? 'white' : 'red',
            Bq_date: new FormControl(val.Bq_date),
            color_Bq_date: val.Bq_date !== null || Date.now() < new Date(val.Bq_date!).getTime() + 7889400000 ? 'white' : 'red',
            Bi_qual: new FormControl(val.Bi_qual),
            color_Bi_qual: val.Bi_qual !== null ? 'white' : 'red',
            Bi_date: new FormControl(val.Bi_date),
            color_Bi_date: val.Bi_date !== null || Date.now() < new Date(val.Bi_date!).getTime() + 7889400000 ? 'white' : 'red',
            Bu_qual: new FormControl(val.Bu_qual),
            color_Bu_qual: val.Bu_qual !== null ? 'white' : 'red',
            Bu_date: new FormControl(val.Bu_date),
            color_Bu_date: val.Bu_date !== null || Date.now() < new Date(val.Bu_date!).getTime() + 7889400000 ? 'white' : 'red',
            By_qual: new FormControl(val.By_qual),
            color_By_qual: val.By_qual !== null ? 'white' : 'red',
            By_date: new FormControl(val.By_date),
            color_By_date: val.By_date !== null || Date.now() < new Date(val.By_date!).getTime() + 7889400000 ? 'white' : 'red',
            Special_decision_end: new FormControl(val.Special_decision_end),
            color_Special_decision_end: val.Special_decision_end === null || new Date(val.Special_decision_end!).getTime() < new Date().getTime() ? 'white' : 'red',
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
      this.spinner.hide()
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

  EditSVO(VOFormElement: { get: (arg0: string) => { (): any; new(): any; at: { (arg0: any): {
    value: any; (): any; new(): any; get: { (arg0: string): { (): any; new(): any; patchValue: { (arg0: boolean): void; new(): any; }; }; new(): any; };
}; new(): any; }; }; }, i: any) {

    // VOFormElement.get('VORows').at(i).get('name').disabled(false)
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(false);
    this.editClicked = true
    // this.isEditableNew = true;

  }

  // On click of correct button in table (after click on edit) this method will call
  async SaveVO(VOFormElement: { get: (arg0: string) => { (): any; new(): any; at: { (arg0: any): {
    value: any; (): any; new(): any; get: { (arg0: string): { (): any; new(): any; patchValue: { (arg0: boolean): void; new(): any; }; }; new(): any; };
}; new(): any; }; }; }, i: any) {
    // alert('SaveVO')
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(true);
    let result: any = await this._api.getTypeRequest('user/member-by-name/' + VOFormElement.get('VORows').at(i).value.LastName + '/' + VOFormElement.get('VORows').at(i).value.FirstName).toPromise()

    this.data_to_send.member_id = result.data[0].ID
    this.data_to_send.Bi_qual = VOFormElement.get('VORows').at(i).value.Bi_qual
    this.data_to_send.Bu_qual = VOFormElement.get('VORows').at(i).value.Bu_qual
    this.data_to_send.By_qual = VOFormElement.get('VORows').at(i).value.By_qual
    this.data_to_send.Bq_qual = VOFormElement.get('VORows').at(i).value.Bq_qual
    this.data_to_send.Special_decision_end = VOFormElement.get('VORows').at(i).value.Special_decision_end

    let update_result = await this._api.postTypeRequest('user/update-operational-status', this.data_to_send).toPromise()
    this._socket.reloadForEveryone()

  }

  // On click of cancel button in the table (after click on edit) this method will call and reset the previous data
  CancelSVO(VOFormElement: { get: (arg0: string) => { (): any; new(): any; at: { (arg0: any): { (): any; new(): any; get: { (arg0: string): { (): any; new(): any; patchValue: { (arg0: boolean): void; new(): any; }; }; new(): any; }; }; new(): any; }; }; }, i: any) {
    VOFormElement.get('VORows').at(i).get('isEditable').patchValue(true);
  }

  exportExcel(): void{
    const data = []
    for(let i = 0; i < this.dataSource.filteredData.length; i++){
      data.push(this.dataSource.filteredData[i].value)
    }
    const copy = JSON.parse(JSON.stringify(data)) as typeof data // deep copy because it also changed the data source values.
    copy.forEach(function(v){delete v.id; delete v.isNewRow; delete v.isEditable})
    TableUtil.exportArrayToExcel(copy, "rbda_members_operational_status")
  }

  applyFilter(event: Event) {
    //  debugger;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
