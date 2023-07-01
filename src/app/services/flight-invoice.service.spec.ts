import { TestBed } from '@angular/core/testing';

import { FlightInvoiceService } from './flight-invoice.service';

describe('FlightInvoiceService', () => {
  let service: FlightInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlightInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
