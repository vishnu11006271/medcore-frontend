import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  DepartmentResponse,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  UpdateDepartmentStatusRequest,
  UpdateDepartmentStatusResponse
} from '../models/department.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  getDepartments(hospitalId: string): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(
      `${this.apiUrl}/hospitals/${hospitalId}/departments`
    );
  }

  createDepartment(
    hospitalId: string,
    request: CreateDepartmentRequest
  ): Observable<CreateDepartmentResponse> {
    return this.http.post<CreateDepartmentResponse>(
      `${this.apiUrl}/hospitals/${hospitalId}/departments`,
      request
    );
  }

  updateDepartment(
    departmentId: string,
    request: UpdateDepartmentRequest
    ): Observable<UpdateDepartmentResponse> {
    return this.http.patch<UpdateDepartmentResponse>(
        `${this.apiUrl}/departments/${departmentId}`,
        request
    );
    }

    updateDepartmentStatus(
    departmentId: string,
    request: UpdateDepartmentStatusRequest
    ): Observable<UpdateDepartmentStatusResponse> {
    return this.http.patch<UpdateDepartmentStatusResponse>(
        `${environment.apiUrl}/departments/${departmentId}/status`,
        request
    );
    }
}