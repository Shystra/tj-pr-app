import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { AuthService } from '../service/auth/auth.service';

const loginRedirect = (state: RouterStateSnapshot) => {
  const router = inject(Router);

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};

const canAccessProtectedRoute = (state: RouterStateSnapshot): boolean | UrlTree => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  return loginRedirect(state);
};

export const authGuard: CanActivateFn = (_route, state) => canAccessProtectedRoute(state);

export const authChildGuard: CanActivateChildFn = (_route, state) => canAccessProtectedRoute(state);

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated() ? router.createUrlTree(['/home']) : true;
};
