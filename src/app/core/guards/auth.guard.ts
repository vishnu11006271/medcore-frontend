import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { map } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.restoreSession().pipe(
    map(isAuthenticated => {
      if (!isAuthenticated) {
        return router.createUrlTree(['/login']);
      }

      const user = authService.user();

      if (!user) {
        return router.createUrlTree(['/login']);
      }

      const allowedRoles = route.data['roles'] as UserRole[] | undefined;

      if (
        allowedRoles &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
      ) {
        return router.createUrlTree(['/dashboard']);
      }

      return true;
    })
  );
};