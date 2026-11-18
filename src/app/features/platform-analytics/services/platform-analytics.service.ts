
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ApiResponse,
  PlatformAnalytics,
} from '../models/platform-analytics.model';

@Injectable({
  providedIn: 'root',
})
export class PlatformAnalyticsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/platform-analytics`;

  getOverview(
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<PlatformAnalytics>> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<ApiResponse<PlatformAnalytics>>(
      `${this.apiUrl}/overview`,
      { params }
    );
  }
}
