import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftBookingComponent } from './aircraft-booking.component';

describe('AircraftBookingComponent', () => {
  let component: AircraftBookingComponent;
  let fixture: ComponentFixture<AircraftBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AircraftBookingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AircraftBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
