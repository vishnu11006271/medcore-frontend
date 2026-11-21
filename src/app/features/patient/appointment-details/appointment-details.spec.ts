import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AppointmentDetails } from './appointment-details';

describe('AppointmentDetails', () => {
  let component: AppointmentDetails;
  let fixture: ComponentFixture<AppointmentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentDetails],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({})
            }
          }
        },
        {
          provide: AppointmentService,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
