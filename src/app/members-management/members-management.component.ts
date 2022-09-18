import { ChangeDetectionStrategy, Component, NgZone, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';



export interface UserInfoFormData{
  Member_id: number
  FirstName: string,
  LastName: string,
  Phone_Number: string,
  Address: string,
  Postal_Code: number,
  EMail: string,
  Country: string,
  City: string,
  License_validity: Date,
  Sep_validity: Date,
  Medical_class_validity: Date,
  Piper_validity: Date
}

export interface UserToAdd{
  FirstName : string,
  LastName : string,
  Avia_Number : number,
  Member_Category : string,
  Member_Since : Date
}


@Component({
  selector: 'app-profile',
  templateUrl: './members-management.component.html',
  providers: [ConfirmationService, MessageService],
  styleUrls: ['./members-management.component.css'],
})

export class MembersManagementComponent implements OnInit {

  public protectedData: any
  public loading: boolean = false
  public userInfo!: UserInfoFormData
  public isEdit: boolean = true
  public updateCompleted: boolean = false
  public selectedMember: any
  public members: any
  public membersList : string[] = []
  public filteredMember!: Observable<string[]>
  public memberControl = new FormControl('')
  public selectedMemberBool = false
  public addMemberClicked = false
  public selectedMemberCategory = ""

  public firstName = ""
  public avia_number = 0
  public lastname = ""
  public member_category = "A"
  public member_since = new Date()

  public categories : any
  public categoriesList: string[] = []

  public userToAdd! : UserToAdd
  public url : any
  public member_id: any;

  constructor(
    private _api: ApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private ngZone: NgZone

  ) { }

  ngOnInit(): void {
    this.userToAdd = {
      FirstName : "",
      LastName : "",
      Avia_Number : 0,
      Member_Category : "",
      Member_Since : new Date()
    }
    this._api.getTypeRequest('user/all-categories').subscribe((res : any) =>
    {
      this.categories = res.data;
      for(var i = 0; i < this.categories.length; i++){
        this.categoriesList.push(this.categories[i].Category_ShortName)
      }
    });
    this._api.getTypeRequest('user/all-members').subscribe((res: any) => {
      this.members = res.data;
      for(var i = 0; i < this.members.length; i++){
        this.membersList.push(this.members[i].fullname)
      }
    })
    this.filteredMember = this.memberControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => value.length >= 1 ? this._filter(value || ''): []),
    );
    console.log(this.filteredMember)
    this.primengConfig.ripple = true;


    /*this._api.getTypeRequest('user/info/' + JSON.parse(localStorage.getItem('userData') || '{}')[0].id).subscribe((res: any) => {
      this.userInfo = res.data[0]
      console.log(this.userInfo.License_validity)
      this._api.getTypeRequest('user/member-id/'+ JSON.parse(localStorage.getItem('userData') || '{}')[0].id).subscribe((res:any) => {
        this.userInfo.Member_id = res.data[0].ID_Member
      })

    });*/





  }

  selectMember(){
    console.log(this.selectedMember)
    this.selectedMemberBool = true

    this._api.getTypeRequest('user/member-by-name/' + this.selectedMember.split(" ")[0] + '/' + this.selectedMember.split(" ")[1]).subscribe((res: any) => {
      this.member_id = res.data[0].ID

      console.log(this.member_id)

      this._api.getTypeRequest('user/info-member/' + this.member_id).subscribe((res1: any) => {
        console.log(res1)
        this.userInfo = res1.data[0]
        this.userInfo.Member_id = this.member_id
        console.log(this.userInfo)
      })
    })
  }
  private _filter(value: string) : string[] {
    const filterValue = value.toLowerCase()

    return this.membersList.filter(member => member.toLowerCase().includes(filterValue))
  }

  onSelectFile(event: any){
    if(event.target.files && event.target.files[0]){
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0])

      reader.onload = (event) => {
        this.url = event.target?.result
      }
    }
  }
  editQualifications(){
    if(this.isEdit){
      this.isEdit = false
    }
    else{
      this.isEdit = true
    }
  }
  delete(){
    this.url = null
  }
  confirm(event: Event) {
    this._api.postTypeRequest('user/update', this.userInfo).subscribe((res:any) => {
      console.log(res)
      if(res.status){
        this.confirmationService.confirm({
          target: event.target as EventTarget,
          message: 'Are you sure that you want to proceed?',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              console.log("accepté bro")
              this.messageService.add({severity:'success', summary:'Success', detail:'Your profile has been updated'});
          },
          reject: () => {
              this.messageService.add({severity:'error', summary:'Rejected', detail:'You have rejected'});
          }
      });
      }
    })



}

sendNewMember(){
  this.userToAdd.FirstName = this.firstName
  this.userToAdd.LastName = this.lastname
  this.userToAdd.Avia_Number = this.avia_number
  this.userToAdd.Member_Category = this.member_category
  this.userToAdd.Member_Since = this.member_since

  this._api.postTypeRequest('user/add-member', this.userToAdd).subscribe((res: any) => {
    console.log(res)

    if(res.status){
      this.messageService.add({severity:'success', summary:'Success', detail:'Member added to the database'});
    }
  })
}

  addNewMember(){
    this.addMemberClicked = true
  }
}
