import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { environment } from '../../../../environments/environment';
import { HospitalDashboardComponent } from './hospital-dashboard';

describe('HospitalDashboardComponent', () => {
  let httpMock: HttpTestingController;

  const overview = {
    hospital: {
      id: 'hospital-1',
      name: 'Medcore Test Hospital',
      email: 'admin@medcore.test',
      phone: '1234567890',
      address: 'Bengaluru',
      status: 'VERIFIED',
    },
    statistics: {
      totalPatients: 120,
      totalDoctors: 8,
      totalDepartments: 4,
      totalAppointments: 250,
      todayAppointments: 12,
    },
    appointments: {
      byStatus: {
        PENDING: 2,
        SCHEDULED: 10,
        CONFIRMED: 20,
        CHECKED_IN: 3,
        IN_PROGRESS: 5,
        COMPLETED: 190,
        CANCELLED: 15,
        NO_SHOW: 5,
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HospitalDashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads and displays live hospital overview data', () => {
    const fixture = TestBed.createComponent(HospitalDashboardComponent);
    fixture.detectChanges();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/hospital-dashboard/overview`
    );
    expect(request.request.method).toBe('GET');

    request.flush({
      success: true,
      message: 'Hospital dashboard overview fetched successfully',
      data: overview,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Medcore Test Hospital');
    expect(fixture.nativeElement.textContent).toContain('120');
    expect(fixture.nativeElement.textContent).toContain('Appointments by Status');
  });

  it('shows a retryable error when the overview request fails', () => {
    const fixture = TestBed.createComponent(HospitalDashboardComponent);
    fixture.detectChanges();

    httpMock.expectOne(
      `${environment.apiUrl}/hospital-dashboard/overview`
    ).flush(
      { error: { message: 'Dashboard unavailable' } },
      { status: 503, statusText: 'Service Unavailable' }
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Dashboard unavailable'
    );
    const retryButton = fixture.nativeElement.querySelector(
      '.error-state button'
    ) as HTMLButtonElement;

    expect(retryButton).toBeTruthy();
    expect(retryButton.textContent).toContain('Try again');

    retryButton.click();
    fixture.detectChanges();

    const retryRequest = httpMock.expectOne(
      `${environment.apiUrl}/hospital-dashboard/overview`
    );
    expect(retryRequest.request.method).toBe('GET');
    retryRequest.flush({
      success: true,
      message: 'Hospital dashboard overview fetched successfully',
      data: overview,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Medcore Test Hospital'
    );
  });
});
