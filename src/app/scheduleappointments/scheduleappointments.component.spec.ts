import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleappointmentsComponent } from './scheduleappointments.component';

describe('ScheduleappointmentsComponent', () => {
  let component: ScheduleappointmentsComponent;
  let fixture: ComponentFixture<ScheduleappointmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleappointmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleappointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
