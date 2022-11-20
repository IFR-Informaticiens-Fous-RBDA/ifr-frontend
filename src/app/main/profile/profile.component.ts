import { ChangeDetectionStrategy, Component, NgZone, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';


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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  providers: [ConfirmationService, MessageService],
  styleUrls: ['./profile.component.css'],
})

export class ProfileComponent implements OnInit {

  public protectedData: any
  public loading: boolean = false
  public userInfo!: UserInfoFormData
  public isEdit: boolean = true
  public updateCompleted: boolean = false

  public url : any

  constructor(
    private _api: ApiService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private ngZone: NgZone,
    private _auth: AuthService

  ) { }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this._auth.getUserDetails().then(currentUser => {
      this._api.getTypeRequest('user/info/' + currentUser[0].id).subscribe((res: any) => {
        this.userInfo = res
        this._api.getTypeRequest('user/member-id/'+ currentUser[0].id).subscribe((res:any) => {
          this.userInfo.Member_id = res.data[0].ID_Member
        })

      });
    })



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
    this._api.postTypeRequest('user/update-current', this.userInfo).subscribe((res:any) => {
      if(res.status){
        this.messageService.add({severity:'success', summary:'Success', detail:'The member has been updated successfully.'});
      }
      else{
        this.messageService.add({severity:'error', summary:'Rejected', detail:'Something went wrong. Please contact one of the website\'s administrators.'});

      }
    })



}

  update(){

  }
}
