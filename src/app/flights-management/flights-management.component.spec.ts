import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightsManagementComponent } from './flights-management.component';

describe('FlightsManagementComponent', () => {
  let component: FlightsManagementComponent;
  let fixture: ComponentFixture<FlightsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlightsManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
