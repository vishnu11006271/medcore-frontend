
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  tap,
  switchMap,
  map,
  catchError,
  of,
  finalize,
  shareReplay
} from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  AuthUser,
  LoginRequest,
  LoginResponse,
  ApiResponse,
  RegisterRequest,
  VerifyEmailRequest
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Concurrent 401 responses share a single refresh-token rotation.
  private sessionVersion = 0;

  private refreshInFlight?: Observable<ApiResponse<{
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
  }>>;

  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  private readonly accessToken = signal<string | null>(null);

  private readonly currentUser = signal<AuthUser | null>(null);

  readonly user = this.currentUser.asReadonly();

  readonly isAuthenticated = () =>
    this.accessToken() !== null;

  login(payload: LoginRequest): Observable<LoginResponse> {

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      payload,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.sessionVersion++;
        this.refreshInFlight = undefined;
        this.accessToken.set(response.data.accessToken);
        this.currentUser.set(response.data.user);
      })
    );
  }

  register(payload: RegisterRequest) {

    return this.http.post<
      ApiResponse<{
        user: AuthUser;
        otpExpiresAt: string;
      }>
    >(
      `${this.apiUrl}/auth/register`,
      payload
    );
  }

  verifyEmail(payload: VerifyEmailRequest) {

    return this.http.post<
      ApiResponse<{
        email: string;
        emailVerified: boolean;
      }>
    >(
      `${this.apiUrl}/auth/verify-email`,
      payload
    );
  }

  refreshSession(): Observable<ApiResponse<{
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
  }>> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    const refreshVersion = this.sessionVersion;
    const request = this.http.post<ApiResponse<{
      accessToken: string;
      tokenType: 'Bearer';
      expiresIn: number;
    }>>(
      `${this.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (refreshVersion === this.sessionVersion) {
          this.accessToken.set(response.data.accessToken);
        }
      }),
      finalize(() => {
        if (refreshVersion === this.sessionVersion) {
          this.refreshInFlight = undefined;
        }
      }),
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.refreshInFlight = request;
    return request;
  }

  getProfile() {

    return this.http.get<ApiResponse<AuthUser>>(
      `${this.apiUrl}/auth/me`
    ).pipe(
      tap(response => {
        this.currentUser.set(response.data);
      })
    );
  }

  // logout() {

  //   return this.http.post<ApiResponse<{ loggedOut: boolean }>>(
  //     `${this.apiUrl}/auth/logout`,
  //     {},
  //     { withCredentials: true }
  //   ).pipe(
  //     tap(() => {
  //       this.clearSession();
  //     })
  //   );
  // }

  logout() {
    return this.http.post<ApiResponse<{ loggedOut: boolean }>>(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      finalize(() => this.clearSession())
    );
  }

  getAccessToken(): string | null {
    return this.accessToken();
  }

  clearSession(): void {
    this.sessionVersion++;
    this.refreshInFlight = undefined;
    this.accessToken.set(null);
    this.currentUser.set(null);
  }

  // restoreSession(): Observable<boolean> {
  //   // Session is already available in memory.
  //   if (this.isAuthenticated() && this.user()) {
  //     return of(true);
  //   }

  //   // Ask the backend for a new access token using
  //   // the HttpOnly refresh cookie.
  //   return this.refreshSession().pipe(
  //     switchMap(() => this.getProfile()),
  //     map(() => true),
  //     catchError(() => {
  //       this.clearSession();
  //       return of(false);
  //     })
  //   );
  // }
  restoreSession(): Observable<boolean> {
    if (this.isAuthenticated() && this.user()) {
      return of(true);
    }

    return this.refreshSession().pipe(
      switchMap(() => this.getProfile()),
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      })
    );
  }

  resendVerificationOtp(payload: { email: string }) {
    return this.http.post<any>(
      `${this.apiUrl}/auth/resend-verification-otp`,
      payload
    );
  }
}
