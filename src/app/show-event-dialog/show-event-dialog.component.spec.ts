import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowEventDialogComponent } from './show-event-dialog.component';

describe('ShowEventDialogComponent', () => {
  let component: ShowEventDialogComponent;
  let fixture: ComponentFixture<ShowEventDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowEventDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowEventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
