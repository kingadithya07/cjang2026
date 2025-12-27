
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase-mock.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(SupabaseService);
  const router = inject(Router) as Router;

  if (auth.user()) {
    return true;
  }

  return router.createUrlTree(['/auth']);
};
