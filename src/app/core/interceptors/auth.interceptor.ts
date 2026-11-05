import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

//   const apiUrl = 'http://localhost:3000';

  // Attach access token to the request.
  const accessToken = authService.getAccessToken();

  const authReq = accessToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        },
        withCredentials: true
      })
    : req.clone({
        withCredentials: true
      });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Refresh only when the access token has expired.
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh') &&
        !req.url.includes('/auth/register') &&
        !req.url.includes('/auth/verify-email')
      ) {
        return authService.refreshSession().pipe(
          switchMap(response => {

            const retryRequest = req.clone({
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