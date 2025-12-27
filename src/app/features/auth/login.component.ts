
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase-mock.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to NewsCloud</h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Or try <span class="font-mono bg-gray-100 px-1 rounded">admin@demo.com</span> for admin access
          </p>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email-address" class="sr-only">Email address</label>
              <input id="email-address" type="email" formControlName="email" class="appearance-none rounded-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Email address">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" type="password" formControlName="password" class="appearance-none rounded-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" placeholder="Password">
            </div>
          </div>

          @if (error()) {
            <div class="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {{ error() }}
            </div>
          }

          <div>
            <button type="submit" [disabled]="loading()" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition">
              @if (loading()) {
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  fb = inject(FormBuilder);
  auth = inject(SupabaseService);
  router: Router = inject(Router);
  
  loading = signal(false);
  error = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  async onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.loading.set(true);
    this.error.set(null);

    try {
      const { email } = this.loginForm.value;
      const { user, error } = await this.auth.signIn(email!);
      
      if (error) throw new Error(error.message);
      
      this.router.navigate(['/admin']);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
