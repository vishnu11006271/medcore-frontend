import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  ApiResponse,
  Patient,
  PatientListData,
  PatientAppointmentsData,
  PatientMedicalRecordsData
} from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/hospital-dashboard`;

  // Get all patients
  getPatients(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<ApiResponse<PatientListData>> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<ApiResponse<PatientListData>>(
      `${this.apiUrl}/patients`,
      { params }
    );
  }

  // Get patient profile
  getPatientById(
    patientId: string
  ): Observable<ApiResponse<Patient>> {

    return this.http.get<ApiResponse<Patient>>(
      `${this.apiUrl}/patients/${patientId}`
    );
  }

  // Get patient's appointments
  getPatientAppointments(
    patientId: string,
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<ApiResponse<PatientAppointmentsData>> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<ApiResponse<PatientAppointmentsData>>(
      `${this.apiUrl}/patients/${patientId}/appointments`,
      { params }
    );
  }

  // Get patient's medical records
  getPatientMedicalRecords(
    patientId: string,
    page: number = 1,
    limit: number = 10
  ): Observable<ApiResponse<PatientMedicalRecordsData>> {

    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<ApiResponse<PatientMedicalRecordsData>>(
      `${this.apiUrl}/patients/${patientId}/medical-records`,
      { params }
    );
  }
}