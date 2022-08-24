import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public protectedData: any
  public loading: boolean = false
  public userInfo: any

  public url : any

  constructor(
    private _api: ApiService,

  ) { }

  ngOnInit(): void {


    this._api.getTypeRequest('user/info/' + JSON.parse(localStorage.getItem('userData') || '{}')[0].id).subscribe((res: any) => {
      this.userInfo = res.data[0]
      console.log(this.userInfo.License_validity)
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

  delete(){
    this.url = null
  }



}
