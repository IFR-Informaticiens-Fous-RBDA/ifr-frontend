import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelManagementComponent } from './fuel-management.component';

describe('FuelManagementComponent', () => {
  let component: FuelManagementComponent;
  let fixture: ComponentFixture<FuelManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FuelManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
