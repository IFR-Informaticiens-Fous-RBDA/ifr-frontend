import { Component, AfterViewChecked,ChangeDetectorRef, ElementRef, ViewChild, OnInit, Injectable, NgZone} from '@angular/core';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
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
import { DateAdapter } from 'angular-calendar';
import { CalendarUtils as BaseCalendarUtils } from 'angular-calendar';
import {GetWeekViewArgs, WeekView, getWeekView} from 'calendar-utils';
import { GlobalConstants } from '../common/global-constants';



@Injectable()
export class CalendarUtils extends BaseCalendarUtils {



  constructor(private dateAdapter2: DateAdapter) {
    super(dateAdapter2)
  }



  getWeekView(args: GetWeekViewArgs): WeekView {
      if(!GlobalConstants.view){

        const BUEvents = args.events?.filter(event => event.meta.type === 'OO-HBU');
        const BIEvents = args.events?.filter(event => event.meta.type === 'OO-HBI');
        const BYEvents = args.events?.filter(event => event.meta.type === 'OO-HBY');
        const BQEvents = args.events?.filter(event => event.meta.type === 'OO-HBQ');
        const calendarEvents = args.events?.filter(event => event.meta.type == 'OO-HBU' && event.meta.type == 'OO-HBI' && event.meta.type !== 'OO-HBY' && event.meta.type !== 'OO-HBQ')

        const calendarView = getWeekView(this.dateAdapter2, {
          ...args,
          events: calendarEvents
        })

        const BUView = getWeekView(this.dateAdapter2, {
          ...args,
          events: BUEvents
        })
        const BIView = getWeekView(this.dateAdapter2, {
          ...args,
          events: BIEvents
        })
        const BYView = getWeekView(this.dateAdapter2, {
          ...args,
          events: BYEvents
        })
        const BQView = getWeekView(this.dateAdapter2, {
          ...args,
          events: BQEvents
        })
        const newView = {
          ...calendarView,
          hourColumns: [
            ...BIView.hourColumns,
            ...BUView.hourColumns,
            ...BYView.hourColumns,
            ...BQView.hourColumns,
          ]
        }

        newView.hourColumns.sort(function(a,b){
          return new Date(a.date).valueOf() - new Date(b.date).valueOf()
        })


        return newView

      }
    else{
      const dutyPilot1Events = args.events?.filter(event => event.meta.type === 'dutypilot1');
      const dutyPilot2Events = args.events?.filter(event => event.meta.type === 'dutypilot2');
      const calendarEvents = args.events?.filter(event => event.meta.type == 'dutypilot1' && event.meta.type == 'dutypilot2')

      const calendarView = getWeekView(this.dateAdapter2, {
        ...args,
        events: calendarEvents
      })

      const dutyPilot1View = getWeekView(this.dateAdapter2, {
        ...args,
        events: dutyPilot1Events
      })
      const dutyPilot2View = getWeekView(this.dateAdapter2, {
        ...args,
        events: dutyPilot2Events
      })

      const newView = {
        ...calendarView,
        hourColumns: [
          ...dutyPilot1View.hourColumns,
          ...dutyPilot2View.hourColumns,
        ]
      }

      newView.hourColumns.sort(function(a,b){
        return new Date(a.date).valueOf() - new Date(b.date).valueOf()
      })


      return newView
    }
  }
}

@Component({
  selector: 'mwl-day-',
  templateUrl: 'aircraft-booking.component.html',
  styleUrls: ['./aircraft-booking.component.css'],
})
export class AircraftBookingComponent implements AfterViewChecked{
  @ViewChild('scrollContainer') scrollContainer: ElementRef<HTMLElement> | undefined;
  view: CalendarView = CalendarView.Week;
  daysInWeek = 7;

  viewDate = new Date();

  slot: Date | undefined;

  clickedDate: Date | undefined;

  clickedColumn: number | undefined;

  events: CalendarEvent[] | any;

  currentUser: any;

  refresh = new Subject<void>();

  cat1aircraft: any[] | any;
  cat2aircraft: any[] | any;
  cat3aircraft: any[] | any;
  cat4aircraft: any[] | any;

  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private ngZone: NgZone,
    private _api: ApiService,
    private cdRef: ChangeDetectorRef
  ) {
    this.cat1aircraft = []
    this.cat2aircraft = []
    this.cat3aircraft = []
    this.cat4aircraft = []
  }

  ngOnInit() {
    GlobalConstants.view = false
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

      this._api.getTypeRequest('event/all-events').subscribe((result: any) => {
        this.events = <CalendarEvent[]>result.data;
        this.events.forEach((event: {
          end: Date; start: Date;
          }) => {
            event.start = new Date(event.start)
            event.end = new Date(event.end)
        });
      });


  }
  changeView(){
    GlobalConstants.view = true
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

  addEventDialog(slot: any) : void{
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width:'500px',
      data: {
        slot: slot.date
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result =>{
      this._api.postTypeRequest('event/addevent', result).subscribe((res: any) => {
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
                description: result.description,
                type: res.data[0].aircraft_registration
              },
              color: {primary: res.data[0].color_primary,
                      secondary: res.data[0].color_secondary},
              draggable: false,
              resizable: {
                beforeStart: false,
                afterEnd: false,
              },

            },
          ]
          /*let nodes = document.getElementsByClassName('cal-event')
          console.log(nodes[0])
          for(var i = 0; i <= nodes.length; i++){
            console.log(window.getComputedStyle(document.getElementsByClassName('cal-event')[i]).backgroundColor)
          }*/

        }
        else{
          console.log("l'even n'ea pas tete cree")
        }
      });
    });
}

ngAfterViewChecked(): void {
    const nodes: any = document.querySelectorAll('.cal-event')
    nodes.forEach((element: any)=>{
      if(window.getComputedStyle(element).backgroundColor === 'rgb(249, 217, 35)'){
        this.cat1aircraft.push(element)
      }
      if(window.getComputedStyle(element).backgroundColor === 'rgb(171, 70, 210)'){
        this.cat2aircraft.push(element)
      }
      if(window.getComputedStyle(element).backgroundColor === 'rgb(54, 174, 124)'){
        this.cat3aircraft.push(element)
      }
      if(window.getComputedStyle(element).backgroundColor === 'rgb(24, 116, 152)'){
        this.cat4aircraft.push(element)
      }
      this.cat1aircraft = [...new Set(this.cat1aircraft)]
      this.cat2aircraft = [...new Set(this.cat2aircraft)]
      this.cat3aircraft = [...new Set(this.cat3aircraft)]
      this.cat4aircraft = [...new Set(this.cat4aircraft)]

      this.cat1aircraft.forEach(function(entry: any){
        entry.id = 'oohbi'
      })
      this.cat2aircraft.forEach(function(entry: any){
        entry.id = 'oohbu'
      })
      this.cat3aircraft.forEach(function(entry: any){
        entry.id = 'oohby'
      })
      this.cat4aircraft.forEach(function(entry: any){
        entry.id = 'oohbq'
      })
    });

}

updateEventDialog(currentEvent: any): void{
  let check = {currentEvent : currentEvent, currentUser: this.currentUser}
  this._api.postTypeRequest('user/check-event', check).subscribe((res: any) => {

    if(res.status){
      const dialogRef = this.dialog.open(UpdateEventComponent, {
        width:'500px',
        data: {
          slot: currentEvent.event.start,
          currentEvent: currentEvent
        }
      });

      dialogRef.afterClosed().subscribe(result =>{
        console.log(result)
        if(!result.delete){
          this._api.postTypeRequest('event/update-event/', result).subscribe((res2: any) => {
            if(res2.status){
              this.events.map((event: { meta: { eventId: any; }; }) => {
                if (event.meta.eventId === result.currentEvent.event.meta.eventId) {
                  this.events = this.events.filter((event: { meta: { eventId: any; }; }) => event.meta.eventId !== result.currentEvent.event.meta.eventId)
                  this.events = [
                    ...this.events,
                    {
                      title: res2.data[0].title,
                      start: result.start,
                      end: result.end,
                      meta: {
                        user: res2.data[0],
                        eventId: result.currentEvent.event.meta.eventId,
                        description: result.description,
                        type: res2.data[0].aircraft_name
                      },
                      color: {primary: res2.data[0].color_primary,
                              secondary: res2.data[0].color_secondary},
                      draggable: false,
                      resizable: {
                        beforeStart: false,
                        afterEnd: false,
                      },

                    },
                  ]
                  console.log(this.events)
                }
              })
            }
          });
        }
        else{
          this._api.postTypeRequest('event/delete-event', result).subscribe((res: any) => {
            if(res.status){
              const updatedEvents = this.events.filter((event: { meta: { eventId: any; }; }) => event.meta.eventId !== result.currentEvent.event.meta.eventId)
              this.events = updatedEvents
              console.log("coucou")
              this.refresh.next()
            }
          })
        }
      });
    }
    else{
      const dialogRef = this.dialog.open(ShowEventDialogComponent, {
        width:'500px',
        data: {
          currentEvent: currentEvent
        }
      });
    }
  })

}

}

