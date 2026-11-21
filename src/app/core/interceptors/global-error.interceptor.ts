import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { GlobalErrorService } from '../services/global-error.service';

export const globalErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const globalErrorService = inject(GlobalErrorService);
  const router = inject(Router);

  const isAuthFormRequest =
    /\/auth\/(login|register|verify-email|resend-verification-otp)(?:\?|$)/i
      .test(request.url);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && !isAuthFormRequest) {
        globalErrorService.showHttpError(error);

        if (error.status === 401) {
          void router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
