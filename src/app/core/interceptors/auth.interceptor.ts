import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);

  // Never send the bearer token or refresh cookie to a third-party origin.
  const apiOrigin = new URL(environment.apiUrl).origin;
  const requestOrigin = new URL(request.url, environment.apiUrl).origin;

  if (requestOrigin !== apiOrigin) {
    return next(request);
  }

  const accessToken = authService.getAccessToken();
  const authRequest = request.clone({
    ...(accessToken
      ? {
          setHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      : {}),
    withCredentials: true
  });

  const isPublicAuthRequest =
    request.url.includes('/auth/login') ||
    request.url.includes('/auth/refresh') ||
    request.url.includes('/auth/register') ||
    request.url.includes('/auth/verify-email') ||
    request.url.includes('/auth/resend-verification-otp');

  return next(authRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicAuthRequest) {
        return authService.refreshSession().pipe(
          switchMap(response => {
            const retryRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${response.data.accessToken}`
              },
              withCredentials: true
            });

            return next(retryRequest);
          }),
          catchError(refreshError => {
            authService.clearSession();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
