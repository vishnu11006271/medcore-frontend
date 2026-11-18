import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Doctor,
  CreateDoctorRequest,
  UpdateDoctorRequest,
  HospitalOption,
  DepartmentOption
} from '../models/doctor.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  // Get all hospitals (SUPER_ADMIN)
  getHospitals(): Observable<ApiResponse<HospitalOption[]>> {
    return this.http.get<ApiResponse<HospitalOption[]>>(
      `${this.apiUrl}/hospitals/verified`
    );
  }

  // Get departments for the selected hospital
  getDepartments(
    hospitalId: string
  ): Observable<ApiResponse<DepartmentOption[]>> {
    return this.http.get<ApiResponse<DepartmentOption[]>>(
      `${this.apiUrl}/hospitals/${hospitalId}/departments`
    );
  }

  // Get doctors for the selected hospital
  getDoctors(
    hospitalId: string
  ): Observable<ApiResponse<Doctor[]>> {
    return this.http.get<ApiResponse<Doctor[]>>(
      `${this.apiUrl}/hospitals/${hospitalId}/doctors`
    );
  }

  // Create doctor
  createDoctor(
    hospitalId: string,
    payload: CreateDoctorRequest
  ): Observable<ApiResponse<Doctor>> {
    return this.http.post<ApiResponse<Doctor>>(
      `${this.apiUrl}/hospitals/${hospitalId}/doctors`,
      payload
    );
  }

  // Get doctor details
  getDoctorById(id: string): Observable<ApiResponse<Doctor>> {
    return this.http.get<ApiResponse<Doctor>>(
      `${this.apiUrl}/doctors/${id}`
    );
  }

  // Update doctor
  updateDoctor(
    id: string,
    payload: UpdateDoctorRequest
  ): Observable<ApiResponse<Doctor>> {
    return this.http.patch<ApiResponse<Doctor>>(
      `${this.apiUrl}/doctors/${id}`,
      payload
    );
  }

  // Activate / deactivate doctor
  updateDoctorStatus(
    id: string,
    isActive: boolean
  ): Observable<ApiResponse<Doctor['user']>> {
    return this.http.patch<ApiResponse<Doctor['user']>>(
      `${this.apiUrl}/doctors/${id}/status`,
      { isActive }
    );
  }
}