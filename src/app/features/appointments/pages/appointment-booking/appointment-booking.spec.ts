import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentBookingComponent } from './appointment-booking';

describe('AppointmentBookingComponent', () => {
  let component: AppointmentBookingComponent;
  let fixture: ComponentFixture<AppointmentBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentBookingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentBookingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
