import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  ApiResponse,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  CreateVitalSignRequest,
  MedicalRecord,
  VitalSign
} from '../models/medical-record.model';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getDoctorRecords(): Observable<ApiResponse<MedicalRecord[]>> {
    return this.http.get<ApiResponse<MedicalRecord[]>>(
      `${this.apiUrl}/medical-records/doctor/my`
    );
  }

  getMedicalRecordById(
    id: string
  ): Observable<ApiResponse<MedicalRecord>> {
    return this.http.get<ApiResponse<MedicalRecord>>(
      `${this.apiUrl}/medical-records/${id}`
    );
  }

  createMedicalRecord(
    request: CreateMedicalRecordRequest
  ): Observable<ApiResponse<MedicalRecord>> {
    return this.http.post<ApiResponse<MedicalRecord>>(
      `${this.apiUrl}/medical-records`,
      request
    );
  }

  updateMedicalRecord(
    id: string,
    request: UpdateMedicalRecordRequest
  ): Observable<ApiResponse<MedicalRecord>> {
    return this.http.patch<ApiResponse<MedicalRecord>>(
      `${this.apiUrl}/medical-records/${id}`,
      request
    );
  }

  finalizeMedicalRecord(
    id: string
  ): Observable<ApiResponse<MedicalRecord>> {
    return this.http.patch<ApiResponse<MedicalRecord>>(
      `${this.apiUrl}/medical-records/${id}/finalize`,
      {}
    );
  }

  addVitals(
    id: string,
    request: CreateVitalSignRequest
  ): Observable<ApiResponse<VitalSign>> {
    return this.http.post<ApiResponse<VitalSign>>(
      `${this.apiUrl}/medical-records/${id}/vitals`,
      request
    );
  }

  getVitals(
    id: string
  ): Observable<ApiResponse<VitalSign[]>> {
    return this.http.get<ApiResponse<VitalSign[]>>(
      `${this.apiUrl}/medical-records/${id}/vitals`
    );
  }
}