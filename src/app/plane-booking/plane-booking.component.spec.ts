import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaneBookingComponent } from './plane-booking.component';

describe('PlaneBookingComponent', () => {
  let component: PlaneBookingComponent;
  let fixture: ComponentFixture<PlaneBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaneBookingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaneBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
