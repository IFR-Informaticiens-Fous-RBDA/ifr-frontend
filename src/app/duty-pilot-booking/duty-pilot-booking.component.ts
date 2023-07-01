import { Component, AfterViewChecked,ChangeDetectorRef, ElementRef, ViewChild, OnInit, Injectable, NgZone, ViewEncapsulation} from '@angular/core';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarUtils,
  CalendarView,
  CalendarWeekViewBeforeRenderEvent
} from 'angular-calendar';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AddEventDialogComponent } from '../add-event-dialog/add-event-dialog.component';
import { UpdateEventComponent } from '../update-event/update-event.component';
import { ApiService } from '../services/api.service';
import { ShowEventDialogComponent } from '../show-event-dialog/show-event-dialog.component';

import { CalendarUtils as BaseCalendarUtils } from 'angular-calendar';
import {GetWeekViewArgs, WeekView, getWeekView} from 'calendar-utils';
import { CalendarModule, DateAdapter } from 'angular-calendar';

import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { GlobalConstants } from '../common/global-constants';
import { AddDutyPilotDialogComponent } from '../add-duty-pilot-dialog/add-duty-pilot-dialog.component';
import { SocketService } from '../services/socket.service';
import { AuthService } from '../services/auth.service';
import { AddDutyPilotNeededDialogComponent } from '../add-duty-pilot-needed-dialog/add-duty-pilot-needed-dialog.component';
import { ConfirmationService, MessageService, PrimeNGConfig } from 'primeng/api';
import { NavigationEnd, Router } from '@angular/router';


@Component({
  selector: 'duty-pilot-booking',
  templateUrl: 'duty-pilot-booking.component.html',
  styleUrls: ['./duty-pilot-booking.component.css'],
  providers: [ConfirmationService, MessageService]
})
export class DutyPilotBookingComponent{
  @ViewChild('scrollContainer') scrollContainer: ElementRef<HTMLElement> | undefined;
  view: CalendarView = CalendarView.Week;
  daysInWeek = 7;

  viewDate = new Date();

  roleUser : any
  allRoles: string[] = []
  canActivate: boolean = false

  slot: Date | undefined;

  clickedDate: Date | undefined;

  clickedColumn: number | undefined;

  events: CalendarEvent[] | any;

  currentUser: any;

  minDate: Date = new Date();



  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private ngZone: NgZone,
    private _api: ApiService,
    private _socket: SocketService,
    private cdRef: ChangeDetectorRef,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private _auth: AuthService,
    private router: Router
  ) {

  }

  ngOnInit() {


    this._socket.onReloadForEveryone().subscribe((data: any) => {
      this._api.getTypeRequest('event/all-duty-pilots').subscribe((result: any) => {
        this.events = <CalendarEvent[]>result.data;
        this.events.forEach((event: {
          end: Date; start: Date;
          }) => {
            event.start = new Date(event.start)
            event.end = new Date(event.end)
        });
      });
    })
    GlobalConstants.view = true
    const CALENDAR_RESPONSIVE = {
      small: {
        breakpoint: '(max-width: 576px)',
        daysInWeek: 2,
      },
      medium: {
        breakpoint: '(max-width: 768px)',
        daysInWeek: 3,
      },
      large: {
        breakpoint: '(max-width: 960px)',
        daysInWeek: 5,
      },
    };

    this.breakpointObserver
      .observe(
        Object.values(CALENDAR_RESPONSIVE).map(({ breakpoint }) => breakpoint)
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: BreakpointState) => {
        const foundBreakpoint = Object.values(CALENDAR_RESPONSIVE).find(
          ({ breakpoint }) => !!state.breakpoints[breakpoint]
        );
        if (foundBreakpoint) {
          this.daysInWeek = foundBreakpoint.daysInWeek;
        } else {
          this.daysInWeek = 7;
        }
        this.cd.markForCheck();
      });

      this._auth.getUserDetails().then(currentUser => {
        this.currentUser = currentUser


        this._api.getTypeRequest('user/role/' + this.currentUser[0].id).subscribe((result: any) => {
          this.roleUser = result.data
          for(let i = 0; i < this.roleUser.length; i++){
            this.allRoles = [
              ...this.allRoles, this.roleUser[i].Role_Name
            ]
          }
        })

        this._api.getTypeRequest('event/all-duty-pilots').subscribe((result: any) => {
          this.events = <CalendarEvent[]>result.data;
          this.events.forEach((event: {
            end: Date; start: Date;
            }) => {
              event.start = new Date(event.start)
              event.end = new Date(event.end)
          });
        });
      })


  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.events = [...this.events];
  }

  changeView(){
    GlobalConstants.view = false
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  userChanged({ event, newUser }: {event:any; newUser:any}) {
    event.color = newUser.color;
    event.meta.user = newUser;
    this.events = [...this.events];
  }

  updateView(dateChange: Date){
    this.viewDate = dateChange;
  }

  addDutyNeeded(){
    const dialogRef = this.dialog.open(AddDutyPilotNeededDialogComponent, {
      width:'500px',
      data: {},
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result =>{
      this._api.postTypeRequest('event/add-duty-pilot-needed', result).subscribe((res: any) => {
        if(res.status && !res.rec_ids && result.isDoublePilotService){
          for(let i = 0; i < res.data.length; i++){
            //add even
            this.events = [
              ...this.events,
              {
                title: 'DUTY PILOT NEEDED',
                start: result.start,
                end: result.end,
                meta: {
                  eventId: res.data[i].insert_result.insertId,
                },
                color: {primary: '#104261',
                        secondary: '#207fba'},
                draggable: false,
                resizable: {
                  beforeStart: false,
                  afterEnd: false,
                },

              },
            ]
          }
          this._socket.reloadForEveryone()

        }
        else if(res.status && !res.rec_ids && !result.isDoublePilotService){
          this.events = [
            ...this.events,
            {
              title: 'DUTY PILOT NEEDED',
              start: result.start,
              end: result.end,
              meta: {
                eventId: res.data[0].insert_result.insertId,
              },
              color: {primary: '#104261',
                      secondary: '#207fba'},
              draggable: false,
              resizable: {
                beforeStart: false,
                afterEnd: false,
              },

            },
          ]
          this._socket.reloadForEveryone()
        }
        else if(res.status && res.rec_ids.length > 0 && !result.isDoublePilotService){
          for(let i = 0; i < res.rec_ids.length; i++){
            this.events = [
              ...this.events,
              {
                title: 'DUTY PILOT NEEDED',
                start: new Date(res.rec_ids[i][0].start),
                end: new Date(res.rec_ids[i][0].end),
                meta: {
                  eventId: res.rec_ids[i][0].id,
                },
                color: {primary: '#104261',
                          secondary: '#207fba'},
                  draggable: false,
                  resizable: {
                    beforeStart: false,
                    afterEnd: false,
                  },
              }
            ]
          }
          this._socket.reloadForEveryone()
        }
        else if(res.status && res.rec_ids.length > 0 && result.isDoublePilotService){ //recurring dates with double service pilot
          for(let i = 0; i < res.rec_ids.length; i++){
            for(let j = 0; j < res.rec_ids[i].length; j++){
              this.events = [
                ...this.events,
                {
                  title: 'DUTY PILOT NEEDED',
                  start: new Date(res.rec_ids[i][j].start),
                  end: new Date(res.rec_ids[i][j].end),
                  meta: {
                    eventId: res.rec_ids[i][j].id,
                  },
                  color: {primary: '#104261',
                          secondary: '#207fba'},
                  draggable: false,
                  resizable: {
                    beforeStart: false,
                    afterEnd: false,
                  },

                },
              ]
            }
            this._socket.reloadForEveryone()
          }
        }
        else{
          console.log("l'even n'ea pas tete cree")
        }
      });
    });
  }

  addEventDialog(slot: any) : void{
    if(this.dateIsValid(slot.date)){
      const dialogRef = this.dialog.open(AddDutyPilotDialogComponent, {
        width:'500px',
        data: {
          slot: slot.date
        },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result =>{
        this._api.postTypeRequest('event/add-duty-pilot', result).subscribe((res: any) => {
          if(res.status){
            //add even
            this.events = [
              ...this.events,
              {
                title: res.data[0].title,
                start: result.start,
                end: result.end,
                meta: {
                  user: res.data[0],
                  eventId: res.data[1].insert_result.insertId,
                  type: res.data[0].type
                },
                color: {primary: '#104261',
                        secondary: '#185b85'},
                draggable: false,
                resizable: {
                  beforeStart: false,
                  afterEnd: false,
                },

              },
            ]
            this._socket.reloadForEveryone()

          }
          else{
            console.log("l'even n'ea pas tete cree")
            switch(res.message){
              case 'TIME_CONFLICT':{
                this.messageService.add({severity:'error', summary:'Error', detail:'You booked the flight in the past'});
                break;
              }
              case 'SLOT_CONFLICT':{
                this.messageService.add({severity:'error', summary: 'Error', detail: 'There already is a duty pilot on this time slot or you already booked this hour'})
                break;
              }
              case 'DUTY_NON_NEEDED':{
                this.messageService.add({severity: 'error', summary: 'Error', detail: 'Duty pilot is not needed at this date'})
                break;
              }
              default:{
                this.messageService.add({severity:'error', summary:'Error', detail:'Something went wrong'});

              }
            }
          }
        });
      });
    }
}

dateIsValid(date: Date): boolean {
  return date >= this.minDate;
}

beforeViewRender(body: CalendarWeekViewBeforeRenderEvent): void {
  body.hourColumns.forEach(hourCol => {
    hourCol.hours.forEach(hour => {
      hour.segments.forEach(segment => {
        if (!this.dateIsValid(segment.date)) {
          segment.cssClass = 'cal-disabled';
        }
      });
    });
  });
}

deleteDutyPilotDialog(currentEvent: any): void{
  let check = {currentEvent : currentEvent, currentUser: this.currentUser}
  this._api.postTypeRequest('user/check-duty-pilot', check).subscribe((res: any) => {

    if(res.status && currentEvent.event.start.getTime() > Date.now()){
      const dialogRef = this.dialog.open(AddDutyPilotDialogComponent, {
        width:'500px',
        data: {
          slot: currentEvent.event.start,
          currentEvent: currentEvent,
          delete: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {

        if(result.delete){
          this._api.postTypeRequest('event/delete-duty-pilot', currentEvent).subscribe((res: any) => {
            if(res.status){
              const updatedEvents = this.events.filter((event: { meta: { eventId: any; }; }) => event.meta.eventId !== currentEvent.event.meta.eventId)
              this.events = updatedEvents
              this._socket.reloadForEveryone()
            }
          })
        }
      })

    }

  })

}

}

