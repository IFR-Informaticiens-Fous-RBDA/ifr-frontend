import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../services/api.service';
import { TableUtil } from '../flights-management/tableUtil';

export interface Member {
  LastName: string;
  FirstName: string;
  National_Number: string;
  CI_Number: string;
  Address: string;
  Home_Number: string;
  Postal_Code: string;
  City: string;
  Country: string;
  GSM_Number: string;
  EMail: string;
  Member_Since: string;
}

@Component({
  selector: 'app-members',
  templateUrl: './members-management.component.html',
  styleUrls: ['./members-management.component.css']
})
export class MembersManagementComponent implements OnInit {

  displayedColumns: string[] = ['lastname', 'firstname', 'nationalNumber', 'ciNumber', 'address', 'homeNumber', 'postalCode', 'city', 'country', 'gsmNumber', 'admissionDate', 'category','email'];
  dataSource: MatTableDataSource<any> | undefined;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator | null = null;

  constructor(private _api: ApiService) {
  }

  ngOnInit() {
    this._api.getTypeRequest('user/all-members-full').subscribe((data: any) => {
      if (data.status === 1) {
        this.dataSource = new MatTableDataSource<Member>(data.data);
        console.log(data)
        this.dataSource.paginator = this.paginator;
      } else {
        console.error('Unable to fetch data');
      }
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource!.filter = filterValue.trim().toLowerCase();
  }

  exportExcel(): void{
    const data = []
    console.log(this.dataSource)
    for(let i = 0; i < this.dataSource!.filteredData.length; i++){
      data.push(this.dataSource!.filteredData[i])
    }
    console.log(data)
    const copy = JSON.parse(JSON.stringify(data)) as typeof data // deep copy because it also changed the data source values.
    TableUtil.exportArrayToExcel(copy, "rbda_members_list")
  }

}
