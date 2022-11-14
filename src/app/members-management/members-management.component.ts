import { ChangeDetectionStrategy, Component, NgZone, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import { Observable } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';


export interface UserInfoFormData{
  newRoles: any,
  isEditRole: boolean,
  Account_id: number,
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
  public isEditRole: boolean = true
  public updateCompleted: boolean = false
  public selectedMember: any
  public members: any
  public membersList : string[] = []
  public filteredMember!: Observable<string[]>
  public selectedMemberBool = false
  public addMemberClicked = false
  public selectedMemberCategory = ""
  public rolesForm = new FormControl()
  public roles: any
  public rolesList: string[] = []
  public currentUserRoles: string[] = []
  public memberControl = new FormControl('')
  public currentUserID: any

  public firstName = ""
  public avia_number = 0
  public lastname = ""
  public member_category = ""
  public member_since = new Date()

  public categories : any
  public categoriesList: any[] = []

  public userToAdd! : UserToAdd
  public url : any
  public member_id: any;
  public categoryDescription: string = "";

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
      Member_Category : "",
      Member_Since : new Date()
    }
    this._api.getTypeRequest('user/all-categories').subscribe((res : any) =>
    {
      this.categories = res.data;
      for(var i = 0; i < this.categories.length; i++){
        this.categoriesList.push([this.categories[i].Category_Name, this.categories[i].Description])
      }
      console.log(this.categoriesList)

    });
    this._api.getTypeRequest('user/all-members').subscribe((res: any) => {
      this.members = res.data;
      for(var i = 0; i < this.members.length; i++){
        this.membersList.push(this.members[i].fullname)
      }
    })
    this._api.getTypeRequest('user/all-roles').subscribe((res: any) => {
      this.roles = res.data;
      for(var i = 0; i < this.roles.length; i++){
        this.rolesList.push(this.roles[i].Role_Name)
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

  async selectMember(){
    console.log(this.selectedMember)
    this.selectedMemberBool = true

    const data_id: any = await this._api.getTypeRequest('user/member-by-name/' + this.selectedMember.split(" ")[0] + '/' + this.selectedMember.split(" ")[1]).toPromise()

    this.member_id = data_id.data[0].ID

    console.log(this.member_id)

    const data_info_member: any = await this._api.getTypeRequest('user/info-member/' + this.member_id).toPromise()

    this.userInfo = data_info_member.data[0]

    console.log(this.userInfo)

    const data_account_id: any = await this._api.getTypeRequest('user/account-id/' + this.member_id).toPromise()

    this.currentUserID = data_account_id.data[0].ID

    const data_current_user_role: any = await this._api.getTypeRequest('user/role/' + this.currentUserID).toPromise()

    data_current_user_role.data.forEach((element: any) => {
      this.currentUserRoles.push(element.Role_Name)
    })

    console.log(this.currentUserRoles)

    this.rolesForm = new FormControl({value: this.currentUserRoles, disabled: true}, Validators.required)

    console.log(this.rolesForm.value)

  }

  selectCategory(){
    this.categoryDescription = this.selectedMemberCategory[1]
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
  editRoles(){
    if(this.isEditRole){
      this.isEditRole = false
    }
    else{
      this.isEditRole = true
    }
  }
  delete(){
    this.url = null
  }
  async confirm(event: Event) {
    const rolesID = await this._api.postTypeRequest('user/role-by-name', this.rolesForm.value).toPromise()
    console.log(rolesID)
    this.userInfo.newRoles = rolesID
    this.userInfo.Member_id = this.member_id
    this.userInfo.Account_id = this.currentUserID
    this.userInfo.isEditRole = this.isEditRole
    this._api.postTypeRequest('user/update', this.userInfo).subscribe((res:any) => {
      console.log(res)
      if(res.status){
        this.messageService.add({severity:'success', summary:'Success', detail:'The member has been updated successfully.'});
      }
      else{
        this.messageService.add({severity:'error', summary:'Rejected', detail:'Something went wrong. Please contact one of the website\'s administrators.'});

      }
    })



}

sendNewMember(){
  this.userToAdd.FirstName = this.firstName
  this.userToAdd.LastName = this.lastname
  this.userToAdd.Member_Category = this.selectedMemberCategory[0]
  this.userToAdd.Member_Since = this.member_since

  this._api.postTypeRequest('user/add-member', this.userToAdd).subscribe((res: any) => {

    if(res.status){
      this.messageService.add({severity:'success', summary:'Success', detail:'Member added to the database'});
    }
    else{
      this.messageService.add({severity:'error', summary:'Rejected', detail:'Something went wrong. Please contact one of the website\'s administrators.'});
    }
  })
}

  addNewMember(){
    this.addMemberClicked ? this.addMemberClicked = false : this.addMemberClicked = true
  }
}
