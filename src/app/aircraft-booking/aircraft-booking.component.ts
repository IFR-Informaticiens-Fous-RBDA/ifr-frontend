import { Component, AfterViewChecked,ChangeDetectorRef, ElementRef, ViewChild, OnInit, Injectable, NgZone, TemplateRef} from '@angular/core';
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarView,
  CalendarWeekViewAllDayEvent,
  CalendarWeekViewBeforeRenderEvent,
  CalendarWeekViewComponent,
  collapseAnimation,
  ɵCalendarWeekViewHourSegmentComponent
} from 'angular-calendar';

import * as moment from 'moment';
import 'moment-timezone';

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
import { SocketService } from '../services/socket.service';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { startOfWeek } from 'date-fns';
import { WeekDay } from 'calendar-utils';
import { CalendarWeekViewHourSegmentComponent } from 'angular-calendar/modules/week/calendar-week-view-hour-segment.component';
import { ViewEncapsulation } from '@angular/core';



@Injectable()
export class CalendarUtils extends BaseCalendarUtils {

  aircrafts: any

  constructor(private dateAdapter2: DateAdapter, private _api: ApiService) {
    super(dateAdapter2)
    this.aircrafts = this._api.getTypeRequest('aircraft/all').subscribe((result:any) => {
      this.aircrafts = result.data
      this.aircrafts = this.aircrafts.map((aircraft:any) => aircraft.registration)
    });
  }


  getWeekView(args: GetWeekViewArgs): WeekView {
      if(!GlobalConstants.view){

        const hourColumns = [];
        console.log(this.aircrafts)
        for (let i = 0; i < this.aircrafts.length; i++) {
          const planeEvents = args.events?.filter(event => event.meta.type === this.aircrafts[i]);
          const planeView = getWeekView(this.dateAdapter2, {
            ...args,
            events: planeEvents
          });
          hourColumns.push(...planeView.hourColumns);
        }

        const calendarEvents = args.events?.filter(event => !this.aircrafts.includes(event.meta.type));
        const calendarView = getWeekView(this.dateAdapter2, {
          ...args,
          events: calendarEvents
        });

        const newView = {
          ...calendarView,
          hourColumns: hourColumns
        };

        newView.hourColumns.sort(function(a,b){
          return new Date(a.date).valueOf() - new Date(b.date).valueOf();
        });

        return newView;

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
  selector: 'aicraft-booking',
  templateUrl: 'aircraft-booking.component.html',
  styleUrls: ['./aircraft-booking.component.css'],
  providers: [ConfirmationService, MessageService,  {
    provide: CalendarDateFormatter  }]
})
export class AircraftBookingComponent{
  @ViewChild('scrollContainer') scrollContainer: ElementRef<HTMLElement> | undefined;
  @ViewChild('weekView', {static: true}) weekView: CalendarWeekViewComponent | undefined;
  @ViewChild('weekView') weekViewElement: ElementRef | undefined;
  @ViewChild(CalendarWeekViewComponent)
  weekViewComponent: CalendarWeekViewComponent | undefined;
  headerTemplate: TemplateRef<any> | undefined;
  view: CalendarView = CalendarView.Week;
  daysInWeek = 7;

  minDate: Date = new Date();

  viewDate = new Date();

  slot: Date | undefined;

  clickedDate: Date | undefined;

  clickedColumn: number | undefined;

  events: CalendarEvent[] | any;

  isWeekend: boolean = true;
  isWeek: boolean = false;

  excludeDays: number[] = [1,2,3,4,5]

  currentUser: any;

  firstDayOfWeek: Date;

  aircrafts: any;

  refresh = new Subject<void>();

  cat1aircraft: any[] | any;
  cat2aircraft: any[] | any;
  cat3aircraft: any[] | any;
  cat4aircraft: any[] | any;
  isDOMLoaded = false;


  private destroy$ = new Subject<void>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private cd: ChangeDetectorRef,
    private _auth: AuthService,
    public dialog: MatDialog,
    private ngZone: NgZone,
    private _api: ApiService,
    private _socket: SocketService,
    private cdRef: ChangeDetectorRef,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private spinner: NgxSpinnerService,
    private dateFormatter: CalendarDateFormatter,
    private elementRef: ElementRef

  ) {
    this.cat1aircraft = []
    this.cat2aircraft = []
    this.cat3aircraft = []
    this.cat4aircraft = []
    this.firstDayOfWeek = startOfWeek(this.viewDate);

    this.aircrafts = this._api.getTypeRequest('aircraft/all').subscribe((result:any) => {
      this.aircrafts = result
    })
  }



  ngOnInit() {
    this.isDOMLoaded = false;
    this.spinner.show()

    this.headerTemplate = this.weekView?.headerTemplate;
    this._socket.onReloadForEveryone().subscribe((data: any) => {
      this._api.getTypeRequest('event/all-events').subscribe((result: any) => {
        this.events = <CalendarEvent[]>result.data;
        this.events.forEach((event: any) => {
          event.start = new Date(event.start)
          event.end = new Date(event.end)
          if(event.meta.instructor.length != 0){
            event['actions'] = [{
              "label": event.meta.instructor + '</br>'
            }]
          }
      });
        this.spinner.hide()
      });
    })
    GlobalConstants.view = false
    this._auth.getUserDetails().then((value: any) => {
      this.currentUser = value
    });

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
          this.daysInWeek = 2;
        }
        this.cd.markForCheck();
      });

      this._api.getTypeRequest('event/all-events').subscribe((result: any) => {
        this.events = <CalendarEvent[]>result.data;

        this.events.forEach((event: any) => {
            event.start = new Date(event.start)
            event.end = new Date(event.end)
            if(event.meta.instructor.length != 0){
              event['actions'] = [{
                "label": event.meta.instructor + '</br>'
              }]
            }
        });
        this.spinner.hide()

      });


  }

  changeView(){
    GlobalConstants.view = true
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate;
  }
  changeDate(){
    this.isDOMLoaded = false;
    this.ngAfterViewInit();
  }
  changeViewToWeek() {
    this.daysInWeek = 5;
    this.excludeDays = [0, 6];
    this.isDOMLoaded = false;
    this.ngAfterViewInit()
  }
  changeViewToFullWeek() {
    this.daysInWeek = 7;
    this.excludeDays = [];
    this.isDOMLoaded = false;
    this.ngAfterViewInit()
  }

  changeViewToWeekend() {
    this.daysInWeek = 2;
    this.excludeDays = [1, 2, 3, 4, 5];
    this.isDOMLoaded = false;
    this.ngAfterViewInit()
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


  ngOnDestroy() {
    this.destroy$.next();
  }

  transformIndex(index: number, columnsPerDay: number): number {
    const columnIndex = (index - 1) % columnsPerDay;
    return columnIndex + 1;
  }

  userChanged({ event, newUser }: {event:any; newUser:any}) {
    event.color = newUser.color;
    event.meta.user = newUser;
    this.events = [...this.events];
  }

  updateView(dateChange: Date){
    this.viewDate = dateChange;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isDOMLoaded = true;

      let aircraftNames = this.aircrafts.data.map((aircraft:any) => aircraft.registration);
      console.log(aircraftNames)

      const timeLabelColumn = document.querySelector('.cal-time-label-column') as HTMLElement;
      const weekView = document.querySelector('.cal-week-view') as HTMLElement;

      if (timeLabelColumn && weekView) {
        weekView.addEventListener('scroll', () => {
          timeLabelColumn.style.transform = `translateX(${weekView.scrollLeft}px)`;
        });
      }
      const columns = document.querySelectorAll('.cal-day-column');
      columns.forEach((col, index) => {
        console.log(aircraftNames[index % aircraftNames.length])
        col.setAttribute('data-aircraft-code', aircraftNames[index % aircraftNames.length]);
      });
      const dayHeaders = document.querySelectorAll('.cal-header');
      const headers = document.querySelector('.cal-day-headers') as HTMLElement
      const columnWidth = columns[0].getBoundingClientRect().width;
      const newWidth = columnWidth * this.aircrafts.data.length;

      if (columns.length > 0 && dayHeaders && headers) {
        headers.style.maxWidth = "none";
        dayHeaders.forEach((header:any, i:number) => {
          const columnStart = i * this.aircrafts.data.length;
          const columnEnd = (i + 1) * this.aircrafts.data.length;

          columns.forEach((column:any, j:number) => {
            if (j >= columnStart && j < columnEnd) {
              if (i % 2 === 0) {
                column.style.backgroundColor = "white";
              } else {
                column.style.backgroundColor = "#f5f5f5";
              }
            }
          });

          header.style.width = `${newWidth}px`;
          header.scrollWidth; // Force a repaint
          header.style.maxWidth = "none";
        });
      }
    }, 100);
  }

   async addEventDialog(slot: any){
    if(this.dateIsValid(slot.date)){
      this.spinner.show()
      const rowxcol = slot.sourceEvent.target.closest(".cal-day-column");
      const columnsPerDay = 5;
      const columnIndex = [...rowxcol.parentElement.children].indexOf(rowxcol);
      const aircraftIndex = Math.floor(columnIndex / columnsPerDay);
      const columnNumber = this.transformIndex(columnIndex % columnsPerDay + 1, columnsPerDay);
      console.log(columnNumber);

      let member_id = await this._api.getTypeRequest('user/member-id/' + this.currentUser[0].id).toPromise()
      let dateLastFlight = await this._api.getTypeRequest('flights/last-flight-account/' + columnNumber + '/' + this.currentUser[0].id).toPromise()

      let dtoMemberAircraft = {
        id_member: (member_id as any).data[0].ID_Member,
        id_aircraft: columnNumber,
        date_last_flight: (dateLastFlight as any).data.length > 0 ? (dateLastFlight as any).data[0].Date_Of_Flight : new Date(+0)
      }
      let isOperational = await this._api.postTypeRequest('user/operational-aircraft', dtoMemberAircraft).toPromise()
        this.spinner.hide()
        const dialogRef = this.dialog.open(AddEventDialogComponent, {
          width:'500px',
          data: {
            aircraft_id: columnNumber,
            slot: slot.date,
            instructor_required : (isOperational as any).status ? false : true
          },
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(result =>{
          if(result != undefined){
            if(result?.maintenance){
              this._api.postTypeRequest('event/addmaintenance', result).subscribe((res: any) => {
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
                this._socket.reloadForEveryone()
              })
            }
            else{
              this._api.postTypeRequest('event/addevent', result).subscribe((res: any) => {
                if(res.status && !res.rec_ids){
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
                  this._socket.reloadForEveryone()

                }
                else if(res.status && res.rec_ids.length > 0){
                  for(let i = 0; i < res.rec_ids.length; i++){
                    this.events = [
                      ...this.events,
                      {
                        title: res.data[0].title,
                        start: new Date(res.rec_ids[i].start),
                        end: new Date(res.rec_ids[i].end),
                        meta: {
                          user: res.data[0],
                          eventId: res.rec_ids[i].id,
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
                  }
                }
                else{
                  switch(res.message){
                    case 'TIME_CONFLICT':{
                      this.messageService.add({severity:'error', summary:'Error', detail:'You booked the flight in the past'});
                      break;
                    }
                    case 'SLOT_CONFLICT':{
                      this.messageService.add({severity:'error', summary: 'Error', detail: 'There already is a flight on this time slot'})
                      break;
                    }
                    case 'M_SLOT_CONFLICT':{
                      this.messageService.add({severity:'error', summary: 'Error', detail: 'There is a maintenance planned at this time slot'})
                      break;
                    }
                    default:{
                      this.messageService.add({severity:'error', summary:'Error', detail:'Something went wrong'});

                    }
                  }
                }
              });
            }
        }
        });
      }
}


updateEventDialog(currentEvent: any): void{
  let check = {currentEvent : currentEvent, currentUser: this.currentUser}
  this._api.postTypeRequest('user/check-event', check).subscribe((res: any) => {

    if(res.status && currentEvent.event.start.getTime() > Date.now()){
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
          if(currentEvent.event.meta.maintenance)
          {
            this._api.postTypeRequest('event/update-maintenance', result).subscribe((res: any) => {
              if(res.status){
                this.events.map((event: { meta: { eventId: any; }; }) => {
                  if (event.meta.eventId === result.currentEvent.event.meta.eventId) {
                    this.events = this.events.filter((event: { meta: { eventId: any; }; }) => event.meta.eventId !== result.currentEvent.event.meta.eventId)
                    this.events = [
                      ...this.events,
                      {
                        title: res.data[0].title,
                        start: result.start,
                        end: result.end,
                        meta: {
                          user: res.data[0],
                          eventId: result.currentEvent.event.meta.eventId,
                          description: result.description,
                          type: res.data[0].aircraft_name
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
                    this._socket.reloadForEveryone()
                  }
                })
              }
            })
          }
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
                  this._socket.reloadForEveryone()
                }
              })
            }
            else{
              switch(res2.message){
                case 'TIME_CONFLICT':{
                  this.messageService.add({severity:'error', summary:'Error', detail:'You booked the flight in the past'});
                  break;
                }
                case 'SLOT_CONFLICT':{
                  this.messageService.add({severity:'error', summary: 'Error', detail: 'There already is a flight on this time slot'})
                  break;
                }
                case 'M_SLOT_CONFLICT':{
                  this.messageService.add({severity:'error', summary: 'Error', detail: 'There is a maintenance planned at this time slot'})
                  break;
                }
                default:{
                  this.messageService.add({severity:'error', summary:'Error', detail:'Something went wrong'});

                }
              }
            }
          });
        }
        else{
          console.log(result)
          this._api.postTypeRequest('event/delete-event', result).subscribe((res: any) => {
            console.log(res)
            if(res.status){
              const updatedEvents = this.events.filter((event: { meta: { eventId: any; }; }) => event.meta.eventId !== result.currentEvent.event.meta.eventId)
              this.events = updatedEvents
              this._socket.reloadForEveryone()
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

