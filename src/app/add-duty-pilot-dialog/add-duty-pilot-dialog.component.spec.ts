import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDutyPilotDialogComponent } from './add-duty-pilot-dialog.component';

describe('AddDutyPilotDialogComponent', () => {
  let component: AddDutyPilotDialogComponent;
  let fixture: ComponentFixture<AddDutyPilotDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddDutyPilotDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDutyPilotDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
