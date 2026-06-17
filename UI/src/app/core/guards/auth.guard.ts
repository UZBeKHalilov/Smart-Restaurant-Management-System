import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  inject(Router).navigate(['/auth/login']);
  return false;
};

export const roleGuard = (roles: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  if (roles.some(r => auth.hasRole(r))) return true;
  inject(Router).navigate(['/dashboard']);
  return false;
};
