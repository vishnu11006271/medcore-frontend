import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  Hospital,
  CreateHospitalRequest
} from '../models/hospital.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class HospitalService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getHospitals(): Observable<ApiResponse<Hospital[]>> {
    return this.http.get<ApiResponse<Hospital[]>>(
      `${this.apiUrl}/hospitals`
    );
  }

  createHospital(
    payload: CreateHospitalRequest
  ): Observable<ApiResponse<Hospital>> {
    return this.http.post<ApiResponse<Hospital>>(
      `${this.apiUrl}/hospitals`,
      payload
    );
  }

  verifyHospital(
    id: string
  ): Observable<ApiResponse<Hospital>> {
    return this.http.patch<ApiResponse<Hospital>>(
      `${this.apiUrl}/hospitals/${id}/verify`,
      {}
    );
  }

  rejectHospital(id: string): Observable<ApiResponse<Hospital>> {
    return this.http.patch<ApiResponse<Hospital>>(
      `${this.apiUrl}/hospitals/${id}/reject`,
      {}
    );
  }
}