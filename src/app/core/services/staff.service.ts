import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateStaffRequest, StaffMember } from '../models/staff.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getStaff(): Observable<ApiResponse<StaffMember[]>> {
    return this.http.get<ApiResponse<StaffMember[]>>(`${this.apiUrl}/staff`);
  }

  createStaff(payload: CreateStaffRequest): Observable<ApiResponse<{
    user: StaffMember;
    otpExpiresAt: string;
  }>> {
    return this.http.post<ApiResponse<{
      user: StaffMember;
      otpExpiresAt: string;
    }>>(`${this.apiUrl}/staff`, payload);
  }

  updateStatus(id: string, isActive: boolean): Observable<ApiResponse<StaffMember>> {
    return this.http.patch<ApiResponse<StaffMember>>(
      `${this.apiUrl}/staff/${id}/status`,
      { isActive }
    );
  }
}
