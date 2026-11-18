import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

import { ApiResponse } from '../../../core/models/auth.model';
import { ActivePrescription } from '../models/active-prescription.model';
import { DispensePrescriptionRequest } from '../models/dispense-prescription.model';

import {
  Medicine,
  CreateMedicineRequest,
  UpdateMedicineRequest,
  MedicineBatch,
  ReceiveStockRequest
} from '../models/pharmacy.model';

@Injectable({
  providedIn: 'root'
})
export class PharmacyService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  private readonly pharmacyUrl = `${this.apiUrl}/pharmacy`;

  // Get all medicines belonging to the logged-in user's hospital.
//   getMedicines(): Observable<ApiResponse<Medicine[]>> {

//     return this.http.get<ApiResponse<Medicine[]>>(
//       `${this.pharmacyUrl}/medicines`
//     );
//   }
    getMedicines(): Observable<Medicine[]> {

    return this.http.get<Medicine[]>(
        `${this.pharmacyUrl}/medicines`
    );
    }

  // Create a medicine.
  createMedicine(
    payload: CreateMedicineRequest
  ): Observable<Medicine> {

    return this.http.post<Medicine>(
      `${this.pharmacyUrl}/medicines`,
      payload
    );
  }

  // Update medicine details.
  updateMedicine(
    medicineId: string,
    payload: UpdateMedicineRequest
  ): Observable<Medicine> {

    return this.http.patch<Medicine>(
      `${this.pharmacyUrl}/medicines/${medicineId}`,
      payload
    );
  }

  // Get batches belonging to a medicine.
  getMedicineBatches(
    medicineId: string
  ): Observable<MedicineBatch[]> {
    return this.http.get<MedicineBatch[]>(
      `${this.pharmacyUrl}/medicines/${medicineId}/batches`
    );
  }

  receiveStock(
    payload: ReceiveStockRequest
  ): Observable<MedicineBatch> {
    return this.http.post<MedicineBatch>(
      `${this.pharmacyUrl}/stock/receive`,
      payload
    );
  }

  getActivePrescriptions(): Observable<ApiResponse<ActivePrescription[]>> {
    return this.http.get<ApiResponse<ActivePrescription[]>>(
      `${this.pharmacyUrl}/prescriptions/active`
    );
  }

  dispensePrescription(
    payload: DispensePrescriptionRequest
  ): Observable<unknown> {
    return this.http.post<unknown>(
      `${this.pharmacyUrl}/dispense`,
      payload
    );
  }
}