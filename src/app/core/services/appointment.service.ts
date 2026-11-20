import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Appointment,
  CreateAppointmentRequest,
  DoctorAppointment,
  MyAppointment,
  HospitalAppointmentsData,
  HospitalAppointmentDetails
} from '../models/appointment.model';
import { tap } from 'rxjs/operators';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private appointmentUpdatedSubject = new Subject<void>();

  readonly appointmentUpdated$ =
    this.appointmentUpdatedSubject.asObservable();

  private notifyAppointmentUpdated(): void {
    this.appointmentUpdatedSubject.next();
  }

  createAppointment(
    request: CreateAppointmentRequest
  ): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(
      `${this.apiUrl}/appointments`,
      request
    );
  }

  getMyAppointments(): Observable<ApiResponse<MyAppointment[]>> {
    return this.http.get<ApiResponse<MyAppointment[]>>(
      `${this.apiUrl}/appointments/my`
    );
  }

  getAppointmentById(id: string): Observable<ApiResponse<MyAppointment>> {
    return this.http.get<ApiResponse<MyAppointment>>(
      `${this.apiUrl}/appointments/${id}`
    );
  }

  cancelAppointment(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(
      `${this.apiUrl}/appointments/${id}/cancel`,
      {}
    );
  }

  getDoctorAppointments(): Observable<ApiResponse<DoctorAppointment[]>> {
    return this.http.get<ApiResponse<DoctorAppointment[]>>(
      `${this.apiUrl}/appointments/doctor/my`
    );
  }

  startAppointment(id: string) {
    return this.http.patch(
      `${this.apiUrl}/appointments/${id}/start`,
      {}
    ).pipe(
      tap(() => this.notifyAppointmentUpdated())
    );
  }

  completeAppointment(id: string) {
    return this.http.patch(
      `${this.apiUrl}/appointments/${id}/complete`,
      {}
    ).pipe(
      tap(() => this.notifyAppointmentUpdated())
    );
  }

  getHospitalAppointments(
    page = 1,
    limit = 10,
    status = '',
    fromDate = '',
    toDate = '',
    search = ''
  ): Observable<ApiResponse<HospitalAppointmentsData>> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (status) {
      params = params.set('status', status);
    }

    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }

    if (toDate) {
      params = params.set('toDate', toDate);
    }

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<ApiResponse<HospitalAppointmentsData>>(
      `${this.apiUrl}/hospital-dashboard/appointments`,
      { params }
    );
  }

  getHospitalAppointmentById(
    id: string
  ): Observable<ApiResponse<HospitalAppointmentDetails>> {
    return this.http.get<ApiResponse<HospitalAppointmentDetails>>(
      `${this.apiUrl}/hospital-dashboard/appointments/${id}`
    );
  }

  confirmAppointment(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.patch<ApiResponse<Appointment>>(
      `${this.apiUrl}/appointments/${id}/confirm`,
      {}
    ).pipe(
      tap(() => this.notifyAppointmentUpdated())
    );
  }

  getDoctorPatients(): Observable<ApiResponse<DoctorPatient[]>> {
    return this.http.get<ApiResponse<DoctorPatient[]>>(
      `${this.apiUrl}/appointments/doctor/my-patients`
    );
  }

}