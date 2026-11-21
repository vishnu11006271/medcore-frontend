import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  NotificationItem,
  NotificationListData
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getNotifications(
    limit = 20,
    unreadOnly = false
  ): Observable<ApiResponse<NotificationListData>> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('unreadOnly', unreadOnly);

    return this.http.get<ApiResponse<NotificationListData>>(
      `${this.apiUrl}/notifications`,
      { params }
    );
  }

  markAsRead(id: string): Observable<ApiResponse<NotificationItem>> {
    return this.http.patch<ApiResponse<NotificationItem>>(
      `${this.apiUrl}/notifications/${encodeURIComponent(id)}/read`,
      {}
    );
  }

  markAllAsRead(): Observable<ApiResponse<{ updatedCount: number }>> {
    return this.http.patch<ApiResponse<{ updatedCount: number }>>(
      `${this.apiUrl}/notifications/read-all`,
      {}
    );
  }
}
