import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightInvoicesComponent } from './flight-invoices.component';

describe('FlightInvoicesComponent', () => {
  let component: FlightInvoicesComponent;
  let fixture: ComponentFixture<FlightInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlightInvoicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
