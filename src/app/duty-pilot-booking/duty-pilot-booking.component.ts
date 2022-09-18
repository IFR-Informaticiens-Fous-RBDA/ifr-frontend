import { Component, AfterViewChecked,ChangeDetectorRef, ElementRef, ViewChild, OnInit, Injectable, NgZone} from '@angular/core';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarUtils,
  CalendarView
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


@Component({
  selector: 'mwl-day-',
  templateUrl: 'duty-pilot-booking.component.html',
  styleUrls: ['./duty-pilot-booking.component.css'],
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


  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private ngZone: NgZone,
    private _api: ApiService,
    private _socket: SocketService,
    private cdRef: ChangeDetectorRef,
  ) {

  }

  ngOnInit() {
    this._api.getTypeRequest('user/role/' + JSON.parse(localStorage.getItem('userData') || '{}')[0].id).subscribe((result: any) => {
      this.roleUser = result.data
      for(let i = 0; i < this.roleUser.length; i++){
        this.allRoles = [
          ...this.allRoles, this.roleUser[i].Role_Name
        ]
      }
    })

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
    this.currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
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

      this._api.getTypeRequest('event/all-duty-pilots').subscribe((result: any) => {
        this.events = <CalendarEvent[]>result.data;
        this.events.forEach((event: {
          end: Date; start: Date;
          }) => {
            event.start = new Date(event.start)
            event.end = new Date(event.end)
        });
      });


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
        console.log(res)
        if(res.status && !res.rec_ids){
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
        else if(res.status && res.rec_ids.length > 0){
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
          console.log(res.message)
        }
      });
    });
  }

  addEventDialog(slot: any) : void{
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
        }
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

