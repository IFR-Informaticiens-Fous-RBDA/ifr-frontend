import {AfterViewInit, Component, ElementRef, Inject, Input, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AircraftBookingComponent } from '../aircraft-booking/aircraft-booking.component';
import * as moment from 'moment';
import { ThemePalette } from '@angular/material/core';
import { FormControl, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { RecurringEventChooserComponent } from '../recurring-event-chooser/recurring-event-chooser.component';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { __values } from 'tslib';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';



export interface DialogData {
  maintenance: boolean
  instructor_required: boolean,
  instructor: string,
  aircraft_id:number,
  slot: Date,
  start: Date,
  end: Date,
  user: any,
  aircraft: Aircraft,
  description: string,
  recurringDates: any | undefined
}
interface Color {
  primary: string,
  secondary: string
}
interface Aircraft {
  value: string;
  viewValue: string;
  color: Color;
}
@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'add-event-dialog.component.html',
  styleUrls: ['./add-event-dialog.component.css']
})
export class AddEventDialogComponent implements AfterViewInit{
  constructor(
    public dialogRef: MatDialogRef<AddEventDialogComponent>,
    private _auth: AuthService,
    private _api: ApiService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {
    this.filteredInstructors = this.instructorControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => value.length >= 1 ? this._filter(value || ''): []),
    );
    this.filteredMembers = this.membersControl.valueChanges.pipe(
      startWith(null),
      map((value: string | null) => value ? this._filterMembers(value) : this.membersList.slice())
)
  }

  @ViewChild('picker') picker: any;
  @ViewChild('picker') picker2: any;
  @ViewChild('memberInput', {static: false}) memberInput!: ElementRef<HTMLInputElement>;
  @ViewChild('intstructorInput', {static: false}) instructorInput!: ElementRef<HTMLInputElement>
  @ViewChild('auto', {static: false}) matAutocomplete!: MatAutocomplete;



  @ViewChild(RecurringEventChooserComponent, {static: false}) reccuringEventsComponent!: RecurringEventChooserComponent
  public visible = true
  public selectable = true
  public removable = true
  public addOnBlur = false
  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public date: moment.Moment | undefined;
  public recurringDates : any
  public disabled = false;
  public selectedAircraft = "";
  public showSpinners = true;
  public instructorControl = new FormControl('')
  public membersControl = new FormControl('')
  public showSeconds = false;
  public name = "";
  public members: any
  public description = "";
  public touchUi = false;
  public enableMeridian = false;
  public total_time = ""
  public minDate: moment.Moment | undefined;
  public maxDate: moment.Moment | undefined;
  public stepHour = 1;
  public stepMinute = 10;
  public stepSecond = 1;
  public color: ThemePalette = 'primary';
  public doesRepeat = false;
  public instructors : any
  public instructorsList: string[] = []
  public membersList: string[] = []
  public filteredInstructors!: Observable<string[]>;
  public filteredMembers!: Observable<string[]>
  public selectedMembers: string[] = []
  public selectedInstructor =""
  public isAddUnavailability: boolean = false;
  public isAddReservation: boolean = true;
  public aircraftsAvailability: string[] = []
  public selectedAircraftAvailablity: string =""
  public roleUser: any
  public allRoles: string[] = []
  public currentUser: any

  public formGroup = new UntypedFormGroup({
    date: new UntypedFormControl(null, [Validators.required]),
    date2: new UntypedFormControl(null, [Validators.required])
  })
  public dateControlStart = new UntypedFormControl(this.data.slot);
  public dateControlEnd = new UntypedFormControl(this.addHoursToDate(this.data.slot, 1));

  public dateControlMinMax = new UntypedFormControl(new Date());

  public options = [
    { value: true, label: 'True' },
    { value: false, label: 'False' }
  ];

  public listColors = ['primary', 'accent', 'warn'];

  public stepHours = [1, 2, 3, 4, 5];
  public stepMinutes = [1, 5, 10, 15, 20, 25];
  public stepSeconds = [1, 5, 10, 15, 20, 25];
  public aircrafts: any;
  public aircraft: any

  ngAfterViewInit(): void {

  }

  ngOnInit(){
    console.log(this.data)
    this._auth.getUserDetails().then((currentUser: any) => {
      this.currentUser = currentUser

      this._api.getTypeRequest('aircraft/aircraft-name-by-id/'+this.data.aircraft_id).subscribe((res : any) =>
      {
        this.aircrafts = res;
        this.aircraft = this.aircrafts[0]

      });

      this._api.getTypeRequest('user/role/' + this.currentUser[0].id).subscribe((result: any) => {
        this.roleUser = result.data
        for(let i = 0; i < this.roleUser.length; i++){
          this.allRoles = [
            ...this.allRoles, this.roleUser[i].Role_Name
          ]
        }
      })

      this._api.getTypeRequest('aircraft/all').subscribe((res:any) => {
        this.aircraftsAvailability = res.data
      })

      this._api.getTypeRequest('user/all-instructors').subscribe((res : any) =>
      {
        this.instructors = res.data;
        for(var i = 0; i < this.instructors.length; i++){
          this.instructorsList.push(this.instructors[i].LastName + ' ' + this.instructors[i].FirstName)
        }


      });

      this._api.getTypeRequest('user/all-members').subscribe((res: any) => {
        this.members = res.data
        this.membersList = this.members.map(function(member: { [x: string]: any; }) {
          return member['fullname']
        })


      })
      let endDate = new Date(this.dateControlEnd.value).getTime();
      let purchaseDate = new Date(this.dateControlStart.value).getTime();
      let diffMs = (endDate - purchaseDate); // milliseconds
      let diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
      let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
      this.total_time = (diffHrs < 9 ? "0" + diffHrs : String(diffHrs)) + ":" + (diffMins < 9 ? "0" + diffMins : String(diffMins))
    })
  }
  private _filter(value: string) : string[] {
    const filterValue = value.toLowerCase()

    return this.instructorsList.filter(instructor => instructor.toLowerCase().includes(filterValue))
  }
  private _filterMembers(value: string) : string[] {
    const filterValue = value.toLowerCase()
    return this.membersList.filter(member => member.toLowerCase().indexOf(filterValue) === 0)
  }



  remove(member: string): void{
    const index = this.selectedMembers.indexOf(member)

    if(index >= 0){
      this.selectedMembers.splice(index, 1)
    }
  }

  editAircraftAvailability(){
    if(this.isAddReservation){
      this.isAddReservation = false
      this.isAddUnavailability = true
    }
    else{
      this.isAddReservation = true
      this.isAddUnavailability = false
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void{
    if(!this.selectedMembers.find(member => member === event.option.viewValue)){
      this.selectedMembers.push(event.option.viewValue)
      this.memberInput.nativeElement.value = ''
      this.membersControl.setValue(null)
    }


  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  computeFlightTime(){
    let endDate = new Date(this.dateControlEnd.value).getTime();
    let purchaseDate = new Date(this.dateControlStart.value).getTime();
    let diffMs = (endDate - purchaseDate); // milliseconds
    let diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
    let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
    this.total_time = (diffHrs < 9 ? "0" + diffHrs : String(diffHrs)) + ":" + (diffMins < 9 ? "0" + diffMins : String(diffMins))
  }
  childChange(value: any){
    this.recurringDates = value
  }
  repeatReservation(){

    if(this.doesRepeat){
      this.doesRepeat = false
    }
    else{
      this.doesRepeat = true
    }
  }

  sendData(){
    this.data.aircraft = this.aircrafts
    this.data.description = this.description
    this.data.start = this.dateControlStart.value
    this.data.end = this.dateControlEnd.value
    this.data.recurringDates = this.recurringDates
    this.data.maintenance = this.isAddUnavailability
    this.data.instructor = this.selectedInstructor

    this.dialogRef.close(this.data);
  }

  addHoursToDate(date: Date, hours: number): Date {
    return new Date(new Date(date).setHours(date.getHours() + hours));
  }
}
