import { ChangeDetectorRef, Component, OnInit, AfterContentChecked  } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private _authService: AuthService, private router: Router, private cdref: ChangeDetectorRef) {}

  ngOnInit() {
    this._authService.clearStorage();
    this._authService.changeAuth(null)
    this.router.navigate(['login']);
  }


}
