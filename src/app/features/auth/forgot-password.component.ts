
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase-mock.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Enter your email to receive reset instructions
          </p>
        </div>

        @if (successMessage()) {
          <div class="bg-green-50 border border-green-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <span class="material-icons text-green-400">check_circle</span>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">Email sent</h3>
                <div class="mt-2 text-sm text-green-700">
                  <p>{{ successMessage() }}</p>
                </div>
                <div class="mt-4">
                  <div class="-mx-2 -my-1.5 flex">
                    <a routerLink="/auth" class="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600">
                      Back to Login
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @else {
          <form class="mt-8 space-y-6" [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
            <div>
              <label for="email-address" class="block text-sm font-medium text-gray-700">Email address</label>
              <input id="email-address" type="email" formControlName="email" class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="you@example.com">
            </div>

            @if (error()) {
              <div class="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                {{ error() }}
              </div>
            }

            <div>
              <button type="submit" [disabled]="loading() || forgotForm.invalid" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition">
                @if (loading()) {
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                Send Reset Link
              </button>
            </div>

            <div class="text-center mt-4">
              <a routerLink="/auth" class="font-medium text-indigo-600 hover:text-indigo-500 text-sm">Back to Sign in</a>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  fb = inject(FormBuilder);
  auth = inject(SupabaseService);
  
  loading = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  async onSubmit() {
    if (this.forgotForm.invalid) return;
    
    this.loading.set(true);
    this.error.set(null);

    try {
      const { email } = this.forgotForm.value;
      const { error } = await this.auth.resetPasswordForEmail(email!);
      
      if (error) throw new Error(error.message);
      
      this.successMessage.set(`We have sent a password reset link to ${email}. Please check your inbox.`);
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
