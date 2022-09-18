import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDutyPilotNeededDialogComponent } from './add-duty-pilot-needed-dialog.component';

describe('AddDutyPilotNeededDialogComponent', () => {
  let component: AddDutyPilotNeededDialogComponent;
  let fixture: ComponentFixture<AddDutyPilotNeededDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDutyPilotNeededDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDutyPilotNeededDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
