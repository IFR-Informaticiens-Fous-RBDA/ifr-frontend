import { Component, AfterViewChecked,ChangeDetectorRef, ElementRef, ViewChild, OnInit, Injectable, NgZone} from '@angular/core';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarView,
  collapseAnimation
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
import { SocketService } from '../services/socket.service';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import { AuthService } from '../services/auth.service';
import { NgxSpinnerService } from 'ngx-spinner';



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
  providers: [ConfirmationService, MessageService]
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

  isWeekend: boolean = true;
  isWeek: boolean = false;

  excludeDays: number[] = [1,2,3,4,5]

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
    private _auth: AuthService,
    public dialog: MatDialog,
    private ngZone: NgZone,
    private _api: ApiService,
    private _socket: SocketService,
    private cdRef: ChangeDetectorRef,
    private messageService: MessageService,
    private primengConfig: PrimeNGConfig,
    private spinner: NgxSpinnerService
  ) {
    this.cat1aircraft = []
    this.cat2aircraft = []
    this.cat3aircraft = []
    this.cat4aircraft = []
  }

  ngOnInit() {
    this.spinner.show()
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
  changeViewToWeek(){
    this.daysInWeek = 5
    this.excludeDays = [0,6]
  }
  changeViewToFullWeek(){
    this.daysInWeek = 7
    this.excludeDays = []
  }
  changeViewToWeekend(){
    this.daysInWeek = 2
    this.excludeDays = [1,2,3,4,5]
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

  transformIndex(index: number): number{
    let tab = [[1,2,3,4],
               [5,6,7,8],
               [9,10,11,12],
               [13,14,15,16],
               [17,18,19,20],
               [21,22,23,24],
               [25,26,27,28]]
    for(let i = 0; i < tab.length; i++){
      for(let j = 0; j < tab.length; j++){
        if(index === tab[i][j]){
          return j+1
        }
      }
    }
    return 0
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


   async addEventDialog(slot: any){
    this.spinner.show()
    const rowxcol = slot.sourceEvent.target.closest(".cal-day-column");
    let colIndex = [...rowxcol.parentElement.children].indexOf(rowxcol) + 1

    let member_id = await this._api.getTypeRequest('user/member-id/' + this.currentUser[0].id).toPromise()
    let dateLastFlight = await this._api.getTypeRequest('flights/last-flight-account/' + this.transformIndex(colIndex) + '/' + this.currentUser[0].id).toPromise()

    let dtoMemberAircraft = {
      id_member: (member_id as any).data[0].ID_Member,
      id_aircraft: this.transformIndex(colIndex),
      date_last_flight: (dateLastFlight as any).data.length > 0 ? (dateLastFlight as any).data[0].Date_Of_Flight : new Date(+0)
    }
    let isOperational = await this._api.postTypeRequest('user/operational-aircraft', dtoMemberAircraft).toPromise()
      this.spinner.hide()
      const dialogRef = this.dialog.open(AddEventDialogComponent, {
        width:'500px',
        data: {
          aircraft_id: this.transformIndex(colIndex),
          slot: slot.date,
          instructor_required : (isOperational as any).status ? false : true
        },
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result =>{
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
            console.log(result)
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
                  this.messageService.add({severity:'error', summary: 'Error', detail: 'There already is a flight on this time slot with the same aircraft'})
                  break;
                }
                default:{
                  this.messageService.add({severity:'error', summary:'Error', detail:'Something went wrong'});

                }
              }
            }
          });
        }
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

    if(res.status && currentEvent.event.start.getTime() > Date.now()){
      const dialogRef = this.dialog.open(UpdateEventComponent, {
        width:'500px',
        data: {
          slot: currentEvent.event.start,
          currentEvent: currentEvent
        }
      });

      dialogRef.afterClosed().subscribe(result =>{
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
              switch(res2.error){
                case 'TIME_CONFLICT':{
                  this.messageService.add({severity:'error', summary:'Error', detail:'You booked the flight in the past'});
                  break;
                }
                case 'SLOT_CONFLICT':{
                  this.messageService.add({severity:'error', summary: 'Error', detail: 'There already is a flight on this time slot with the same aircraft'})
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
          this._api.postTypeRequest('event/delete-event', result).subscribe((res: any) => {
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

