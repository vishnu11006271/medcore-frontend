import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  ApiResponse
} from '../../core/models/auth.model';

import {
  HospitalRegistrationRequest,
  HospitalRegistrationResponse
} from '../models/hospital-registration.model';

@Injectable({
  providedIn: 'root'
})
export class HospitalRegistrationService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  registerHospital(
    payload: HospitalRegistrationRequest
  ): Observable<ApiResponse<HospitalRegistrationResponse>> {

    return this.http.post<
      ApiResponse<HospitalRegistrationResponse>
    >(
      `${this.apiUrl}/hospitals/register`,
      payload
    );
  }
}