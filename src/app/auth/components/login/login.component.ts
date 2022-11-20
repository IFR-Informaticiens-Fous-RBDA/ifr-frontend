import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import { ApiService } from './../../../services/api.service'
import { AuthService } from './../../../services/auth.service'
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLogin: boolean = false
  error: boolean = false
  constructor(
    private _api: ApiService,
    private _auth: AuthService,
    private _router:Router
  ) { }

  ngOnInit() {


  }



  onSubmit(form: NgForm) {
    this._api.postTypeRequest('user/login', form.value).subscribe((res: any) => {
      console.log(res)
      if (res.status) {
        console.log(JSON.stringify(res.data))
        this._auth.setDataInLocalStorage('token', res.token);
        this._router.navigate(['']);
      }
      else{
        this.error = true
      }
    })


  }

  isUserLogin(){

    if(localStorage.getItem('token')){

        this.isLogin = true;
    }

  }

  logout(){
    this._auth.clearStorage()
    this.isLogin = false
    this._router.navigate(['login']);
  }
}
