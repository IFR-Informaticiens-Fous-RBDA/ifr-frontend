import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelDeliveryManagementComponent } from './fuel-delivery-management.component';

describe('FuelDeliveryManagementComponent', () => {
  let component: FuelDeliveryManagementComponent;
  let fixture: ComponentFixture<FuelDeliveryManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FuelDeliveryManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelDeliveryManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
