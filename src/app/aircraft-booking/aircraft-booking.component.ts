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


const colors: any={
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
}
const users: User[] = [
  {
    id: 0,
    name: 'OO-HBI',
    color: colors.yellow,
  },
  {
    id: 1,
    name: 'OO-HBU',
    color: colors.blue,
  },
  {
    id: 2,
    name: 'OO-HBY',
    color: colors.red,
  },
  {
    id: 3,
    name: 'OO-HBQ',
    color: colors.blue,
  },
];

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

  users = users;

  clickedDate: Date | undefined;

  clickedColumn: number | undefined;

  events: CalendarEvent[] = [
    {
      title: 'An event',
      color: users[0].color,
      start: addHours(startOfDay(new Date()), 10),
      meta: {
        user: users[0],
      },
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      title: 'Another event',
      color: users[1].color,
      start: addHours(startOfDay(new Date()), 5),
      meta: {
        user: users[1],
      },
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      title: 'A 3rd event',
      color: users[0].color,
      start: addHours(startOfDay(new Date()), 5),
      meta: {
        user: users[0],
      },
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    },
    {
      title: 'A 4rd event',
      color: users[0].color,
      start: addHours(startOfDay(new Date()), 5),
      meta: {
        user: users[0],
      },
      resizable: {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: true,
    }
  ];



  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private cd: ChangeDetectorRef,
    public dialog: MatDialog,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    console.log(this.events);
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
    console.log(dateChange)
    this.viewDate = dateChange;
  }

  addEventDialog(slot: any) : void{
    console.log("kikou")
    const dialogRef = this.dialog.open(AddEventDialogComponent, {
      width:'500px',
      data: {
        slot: slot.date
      }
    });
    console.log("je suis fermé")

    dialogRef.afterClosed().subscribe(result =>{
      //add even
      console.log("je suis dans after closed")
      console.log(result.aircraft.color)
        this.events = [
          ...this.events,
          {
            title: result.description,
            start: result.start,
            end: result.end,
            color: result.aircraft.color,
            draggable: true,
            resizable: {
              beforeStart: true,
              afterEnd: true,
            },

          },
        ];
      console.log(this.events)

      console.log(result);

      this.slot = result
    });
}


}
