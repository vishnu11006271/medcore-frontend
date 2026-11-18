import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


import {
  PlatformUser,
  UsersListData,
  UsersQuery
} from '../models/user-management.model';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';


@Injectable({
  providedIn: 'root'
})
export class UsersService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/users`;

  getUsers(query: UsersQuery): Observable<ApiResponse<UsersListData>> {
    let params = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return this.http.get<ApiResponse<UsersListData>>(
      this.apiUrl,
      { params }
    );
  }

  getUserById(id: string): Observable<ApiResponse<PlatformUser>> {
    return this.http.get<ApiResponse<PlatformUser>>(
      `${this.apiUrl}/${id}`
    );
  }

  updateUserStatus(
    id: string,
    isActive: boolean
  ): Observable<ApiResponse<PlatformUser>> {
    return this.http.patch<ApiResponse<PlatformUser>>(
      `${this.apiUrl}/${id}/status`,
      { isActive }
    );
  }
}