import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DutyPilotBookingComponent } from './duty-pilot-booking.component';

describe('DutyPilotBookingComponent', () => {
  let component: DutyPilotBookingComponent;
  let fixture: ComponentFixture<DutyPilotBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DutyPilotBookingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DutyPilotBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
