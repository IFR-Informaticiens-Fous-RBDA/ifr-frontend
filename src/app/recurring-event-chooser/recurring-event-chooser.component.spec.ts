import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringEventChooserComponent } from './recurring-event-chooser.component';

describe('RecurringEventChooserComponent', () => {
  let component: RecurringEventChooserComponent;
  let fixture: ComponentFixture<RecurringEventChooserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecurringEventChooserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecurringEventChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
