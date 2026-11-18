import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  LaboratoryDashboardResponse,
  LaboratoryTestsResponse,
  LaboratoryTestResponse,
  CreateLaboratoryTest,
  UpdateLaboratoryTest,
  LaboratoryOrdersResponse,
  LaboratoryOrderResponse,
  UploadLabResult,
  CreateLaboratoryOrder,
  ApproveLabResult,
  PatientLabResult
} from '../models/laboratory.model';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class LaboratoryService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  // Hospital Admin Dashboard
  getAdminDashboard(): Observable<LaboratoryDashboardResponse> {
    return this.http.get<LaboratoryDashboardResponse>(
      `${this.apiUrl}/lab/admin/dashboard`
    );
  }

  // Fetch all laboratory tests
  getLabTests(): Observable<LaboratoryTestsResponse> {
    return this.http.get<LaboratoryTestsResponse>(
      `${this.apiUrl}/lab/tests`
    );
  }

  // Create laboratory test
  createLabTest(
    payload: CreateLaboratoryTest
  ): Observable<LaboratoryTestResponse> {

    return this.http.post<LaboratoryTestResponse>(
      `${this.apiUrl}/lab/tests`,
      payload
    );
  }

  // Update laboratory test
  updateLabTest(
    id: string,
    payload: UpdateLaboratoryTest
  ): Observable<LaboratoryTestResponse> {

    return this.http.patch<LaboratoryTestResponse>(
      `${this.apiUrl}/lab/tests/${id}`,
      payload
    );
  }

  // Fetch laboratory orders for the logged-in Lab Technician
  getLabOrders(): Observable<LaboratoryOrdersResponse> {
    return this.http.get<LaboratoryOrdersResponse>(
      `${this.apiUrl}/lab/orders`
    );
  }

  // Fetch a single laboratory order
  getLabOrderById(id: string): Observable<LaboratoryOrderResponse> {
    return this.http.get<LaboratoryOrderResponse>(
      `${this.apiUrl}/lab/orders/${id}`
    );
  }

  // Collect sample
  collectSample(id: string): Observable<LaboratoryOrderResponse> {
    return this.http.patch<LaboratoryOrderResponse>(
      `${this.apiUrl}/lab/orders/${id}/collect-sample`,
      {}
    );
  }

  // Start processing
  startProcessing(id: string): Observable<LaboratoryOrderResponse> {
    return this.http.patch<LaboratoryOrderResponse>(
      `${this.apiUrl}/lab/orders/${id}/start-processing`,
      {}
    );
  }

  // Upload result
  uploadLabResult(
    id: string,
    payload: UploadLabResult
  ): Observable<LaboratoryOrderResponse> {
    return this.http.patch<LaboratoryOrderResponse>(
      `${this.apiUrl}/lab/orders/${id}/upload-result`,
      payload
    );
  }

  // Create laboratory order (Doctor)
  createLabOrder(
    payload: CreateLaboratoryOrder
  ): Observable<LaboratoryOrderResponse> {
    return this.http.post<LaboratoryOrderResponse>(
      `${this.apiUrl}/lab/orders`,
      payload
    );
  }

  // Approve laboratory result (Doctor)
  approveLabResult(
    id: string,
    payload: ApproveLabResult
  ): Observable<LaboratoryOrderResponse> {
    return this.http.patch<LaboratoryOrderResponse>(
      `${this.apiUrl}/lab/orders/${id}/approve`,
      payload
    );
  }

  getPatientResults(): Observable<PatientLabResult[]> {
    return this.http.get<ApiResponse<PatientLabResult[]>>(
      `${this.apiUrl}/lab/patient/results`
    ).pipe(
      map(response => response.data)
    );
  }
}