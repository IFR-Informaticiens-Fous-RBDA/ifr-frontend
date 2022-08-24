import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import {ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewChecked{
  title = 'infor-rbda';

  public localStorage : any

  constructor(private cdref: ChangeDetectorRef){}

  ngOnInit(){
    this.localStorage = null
  }
  ngAfterViewChecked(){
    if(localStorage.getItem('userData')){
      this.localStorage = JSON.parse(localStorage.getItem('userData') || "")[0];
    }
    this.cdref.detectChanges()
  }
}
