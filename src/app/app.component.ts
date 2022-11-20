import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import {ChangeDetectorRef } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'infor-rbda';

  public localStorage : any
  public user: any
  public roles: any

  constructor(private cdref: ChangeDetectorRef, private _auth: AuthService){}

  ngOnInit(){
    this._auth.currentAuth.subscribe((value)=>{
      this.user = value
    })
  }
  ngAfterContentChecked() : void {
    this.cdref.detectChanges();
}


}
