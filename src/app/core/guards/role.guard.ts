import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user();

  // No authenticated user.
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  // Read the roles allowed for this route.
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  // A route without role restrictions is accessible
  // to any authenticated user.
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Check whether the user's role is permitted.
  if (allowedRoles.includes(user.role)) {
    return true;
  }

  // User is logged in but does not have permission.
  return router.createUrlTree(['/dashboard']);
};