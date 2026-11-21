import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HospitalDashboardResponse } from '../models/hospital-dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class HospitalDashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/hospital-dashboard`;

  getOverview(): Observable<HospitalDashboardResponse> {
    return this.http.get<HospitalDashboardResponse>(
      `${this.apiUrl}/overview`
    );
  }
}
