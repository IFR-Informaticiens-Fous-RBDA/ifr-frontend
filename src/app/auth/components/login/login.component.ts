import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

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
    private _router:Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {

  }



  onSubmit(form: NgForm) {
    this.spinner.show()
    this._api.postTypeRequest('user/login', form.value).subscribe((res: any) => {
      if (res.status) {
        this._auth.setDataInLocalStorage('token', res.token);
        this._router.navigate(['']);
      }
      else{
        this.error = true
      }
      this.spinner.hide()

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
