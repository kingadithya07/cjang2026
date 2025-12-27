
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase-mock.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(SupabaseService);
  const router = inject(Router) as Router;
  const user = auth.user();
  
  const expectedRoles = route.data?.['roles'] as string[] | undefined;

  if (user && expectedRoles && expectedRoles.includes(user.role)) {
    return true;
  }

  // Redirect to home if unauthorized
  return router.createUrlTree(['/']);
};
