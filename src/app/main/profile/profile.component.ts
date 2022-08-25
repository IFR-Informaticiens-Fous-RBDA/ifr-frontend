import { ChangeDetectionStrategy, Component, NgZone, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';


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
    private ngZone: NgZone

  ) { }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
    this._api.getTypeRequest('user/info/' + JSON.parse(localStorage.getItem('userData') || '{}')[0].id).subscribe((res: any) => {
      this.userInfo = res.data[0]
      console.log(this.userInfo.License_validity)
      this._api.getTypeRequest('user/member-id/'+ JSON.parse(localStorage.getItem('userData') || '{}')[0].id).subscribe((res:any) => {
        this.userInfo.Member_id = res.data[0].ID_Member
      })

    });



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

  update(){

  }
}
