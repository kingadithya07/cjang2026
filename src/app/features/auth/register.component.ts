
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase-mock.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Join CJNEWSHUB today
          </p>
        </div>
        <form class="mt-8 space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <div>
              <label for="email-address" class="block text-sm font-medium text-gray-700">Email address</label>
              <input id="email-address" type="email" formControlName="email" class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="you@example.com">
            </div>
            
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <div class="relative mt-1">
                <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10" placeholder="Password">
                <button type="button" (click)="togglePassword()" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer focus:outline-none">
                  <span class="material-icons text-xl">{{ showPassword() ? 'visibility' : 'visibility_off' }}</span>
                </button>
              </div>
            </div>

            <div>
              <label for="role" class="block text-sm font-medium text-gray-700">Account Role</label>
              <select id="role" formControlName="role" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border bg-white">
                <option value="reader">Reader (Standard)</option>
                <option value="editor">Editor</option>
                <option value="admin">Administrator</option>
              </select>
              <p class="mt-1 text-xs text-gray-500">Select a role for demo purposes.</p>
            </div>
          </div>

          @if (error()) {
            <div class="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {{ error() }}
            </div>
          }

          <div>
            <button type="submit" [disabled]="loading() || registerForm.invalid" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition">
              @if (loading()) {
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              Create Account
            </button>
          </div>

          <div class="text-center mt-4">
            <p class="text-sm text-gray-600">
              Already have an account? 
              <a routerLink="/auth" class="font-medium text-indigo-600 hover:text-indigo-500">Sign in</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  auth = inject(SupabaseService);
  router: Router = inject(Router);
  
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['reader', Validators.required]
  });

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;
    
    this.loading.set(true);
    this.error.set(null);

    try {
      const { email, password, role } = this.registerForm.value;
      const { user, error } = await this.auth.signUp(email!, password!, role as 'admin' | 'editor' | 'reader');
      
      if (error) throw new Error(error.message);
      
      // Redirect based on role
      if (user?.role === 'admin' || user?.role === 'editor') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']); // Readers go home
      }
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
