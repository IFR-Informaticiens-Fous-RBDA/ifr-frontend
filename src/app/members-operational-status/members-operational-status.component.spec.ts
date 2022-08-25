import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersOperationalStatusComponent } from './members-operational-status.component';

describe('MembersOperationalStatusComponent', () => {
  let component: MembersOperationalStatusComponent;
  let fixture: ComponentFixture<MembersOperationalStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembersOperationalStatusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MembersOperationalStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
