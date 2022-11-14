import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotAuthorizedHandlerComponent } from './not-authorized-handler.component';

describe('NotAuthorizedHandlerComponent', () => {
  let component: NotAuthorizedHandlerComponent;
  let fixture: ComponentFixture<NotAuthorizedHandlerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotAuthorizedHandlerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotAuthorizedHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
