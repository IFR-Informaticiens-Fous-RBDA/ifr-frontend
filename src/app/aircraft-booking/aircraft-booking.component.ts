import { Component, ChangeDetectionStrategy, AfterViewInit,  ChangeDetectorRef, ElementRef, ViewChild, OnInit, OnDestroy, Inject, NgZone } from '@angular/core';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarView
} from 'angular-calendar';
import { differenceInMinutes, addHours, startOfDay, startOfHour } from 'date-fns';
import { User } from '../day-view-scheduler/day-view-scheduler.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AddEventDialogComponent } from '../add-event-dialog/add-event-dialog.component';
import { UpdateEventComponent } from '../update-event/update-event.component';
import { ApiService } from '../services/api.service';
import { ShowEventDialogComponent } from '../show-event-dialog/show-event-dialog.component';

@Component({
  selector: 'mwl-day-',
  templateUrl: 'aircraft-booking.component.html',
  styleUrls: ['./aircraft-booking.component.css'],
})
export class AircraftBookingComponent {
  @ViewChild('scrollContainer') scrollContainer: ElementRef<HTMLElement> | undefined;
  view: CalendarView = CalendarView.Week;
  daysInWeek = 7;

  viewDate = new Date();

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
    private _api: ApiService
  ) {}

  ngOnInit() {
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

      console.log(localStorage.getItem('userData'))
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
      }
    });

    dialogRef.afterClosed().subscribe(result =>{
      this._api.postTypeRequest('event/addevent', result).subscribe((res: any) => {
        console.log(res)
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
              description: result.description
            },
            color: {primary: res.data[0].color_primary,
                    secondary: res.data[0].color_secondary},
            draggable: false,
            resizable: {
              beforeStart: false,
              afterEnd: false,
            },

          },
        ];
      this.slot = result
    });
      });

}

updateEventDialog(currentEvent: any){
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
        if(!result.delete){
          this._api.postTypeRequest('event/update-event/', result).subscribe((res: any) => {
            const updatedEvents = this.events.map((event: { meta: { eventId: any; }; }) => {
              if (event.meta.eventId === result.currentEvent.event.meta.eventId) {
                return { ...event, title: res.data[0].title, color: { primary: res.data[0].color_primary, secondary: res.data[0].color_secondary }, start: result.start, end: result.end };
              }
              return event
            })
            this.events = updatedEvents
          });
        }
        else{
          this._api.postTypeRequest('event/delete-event', result).subscribe((res: any) => {
            if(res.status){
              const updatedEvents = this.events.filter((event: { meta: { eventId: any; }; }) => event.meta.eventId !== result.currentEvent.event.meta.eventId)
              this.events = updatedEvents
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
