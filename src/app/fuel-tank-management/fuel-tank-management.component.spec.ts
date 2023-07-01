import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelTankManagementComponent } from './fuel-tank-management.component';

describe('FuelTankManagementComponent', () => {
  let component: FuelTankManagementComponent;
  let fixture: ComponentFixture<FuelTankManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FuelTankManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelTankManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
