import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlyingCostFuelConsumptionComponent } from './flying-cost-fuel-consumption.component';

describe('FlyingCostFuelConsumptionComponent', () => {
  let component: FlyingCostFuelConsumptionComponent;
  let fixture: ComponentFixture<FlyingCostFuelConsumptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlyingCostFuelConsumptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlyingCostFuelConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
