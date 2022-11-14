import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftPotentialComponent } from './aircraft-potential.component';

describe('AircraftPotentialComponent', () => {
  let component: AircraftPotentialComponent;
  let fixture: ComponentFixture<AircraftPotentialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AircraftPotentialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftPotentialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
