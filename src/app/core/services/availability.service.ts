
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  AvailabilityInterval,
  WeeklyAvailabilityRequest,
  AvailableSlotsResponse
} from '../models/availability.model';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {

  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  // Save weekly availability
  setWeeklySchedule(
    doctorId: string,
    request: WeeklyAvailabilityRequest
  ): Observable<ApiResponse<AvailabilityInterval[]>> {

    return this.http.put<ApiResponse<AvailabilityInterval[]>>(
      `${this.apiUrl}/doctors/${doctorId}/availability`,
      request
    );
  }

  // Get weekly availability
  getWeeklySchedule(
    doctorId: string
  ): Observable<ApiResponse<AvailabilityInterval[]>> {

    return this.http.get<ApiResponse<AvailabilityInterval[]>>(
      `${this.apiUrl}/doctors/${doctorId}/availability`
    );
  }

  // Get available slots for a selected date
  getAvailableSlots(
    doctorId: string,
    date: string
  ): Observable<ApiResponse<AvailableSlotsResponse>> {

    return this.http.get<ApiResponse<AvailableSlotsResponse>>(
      `${this.apiUrl}/doctors/${doctorId}/availability/slots`,
      {
        params: { date }
      }
    );
  }
}
