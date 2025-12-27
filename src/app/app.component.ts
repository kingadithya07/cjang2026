import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SupabaseService } from './core/services/supabase-mock.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen flex flex-col bg-gray-50">
      <!-- Navbar -->
      <nav class="bg-indigo-700 text-white shadow-lg z-50 sticky top-0" aria-label="Main Navigation">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            
            <!-- Logo & Desktop Nav -->
            <div class="flex items-center">
              <a routerLink="/" class="flex-shrink-0 font-bold text-xl tracking-wider flex items-center gap-2" aria-label="NewsCloud Home">
                <span class="material-icons">newspaper</span>
                <span>NEWS<span class="text-indigo-300">CLOUD</span></span>
              </a>
              <div class="hidden md:block" role="navigation">
                <div class="ml-10 flex items-baseline space-x-4">
                  <a routerLink="/articles" 
                     routerLinkActive="bg-indigo-800 text-white shadow-inner" 
                     class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700">
                     Articles
                  </a>
                  <a routerLink="/epaper" 
                     routerLinkActive="bg-indigo-800 text-white shadow-inner" 
                     class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700">
                     E-Paper
                  </a>
                  @if (auth.user()?.role === 'admin') {
                    <a routerLink="/admin" 
                       routerLinkActive="bg-indigo-800 text-white shadow-inner" 
                       class="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700">
                       Admin Console
                    </a>
                  }
                </div>
              </div>
            </div>

            <!-- User Menu (Desktop) -->
            <div class="hidden md:block">
              @if (auth.user()) {
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2 opacity-90">
                    <span class="material-icons text-sm">account_circle</span>
                    <span class="text-sm font-medium">{{ auth.user()?.email }}</span>
                  </div>
                  <button (click)="logout()" class="bg-indigo-800 hover:bg-indigo-900 px-4 py-1.5 rounded text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700 shadow-sm border border-indigo-600">
                    Logout
                  </button>
                </div>
              } @else {
                <a routerLink="/auth" class="text-white hover:text-indigo-200 text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-600 transition">
                  Sign In
                </a>
              }
            </div>

            <!-- Mobile Menu Button -->
            <div class="-mr-2 flex md:hidden">
              <button (click)="toggleMobileMenu()" type="button" 
                class="bg-indigo-700 inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-700 focus:ring-white" 
                [attr.aria-expanded]="mobileMenuOpen()"
                aria-controls="mobile-menu">
                <span class="sr-only">Open main menu</span>
                <span class="material-icons">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu -->
        @if (mobileMenuOpen()) {
          <div class="md:hidden bg-indigo-800 border-t border-indigo-600" id="mobile-menu">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a routerLink="/articles" (click)="closeMobileMenu()" 
                 routerLinkActive="bg-indigo-900 text-white" 
                 class="text-indigo-100 hover:bg-indigo-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2">
                 <span class="material-icons text-sm">article</span> Articles
              </a>
              <a routerLink="/epaper" (click)="closeMobileMenu()" 
                 routerLinkActive="bg-indigo-900 text-white" 
                 class="text-indigo-100 hover:bg-indigo-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2">
                 <span class="material-icons text-sm">description</span> E-Paper
              </a>
              @if (auth.user()?.role === 'admin') {
                <a routerLink="/admin" (click)="closeMobileMenu()" 
                   routerLinkActive="bg-indigo-900 text-white" 
                   class="text-indigo-100 hover:bg-indigo-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2">
                   <span class="material-icons text-sm">dashboard</span> Admin Console
                </a>
              }
            </div>
            <div class="pt-4 pb-4 border-t border-indigo-700">
              @if (auth.user()) {
                <div class="flex items-center px-5 mb-3">
                  <div class="flex-shrink-0">
                    <span class="material-icons text-indigo-200 text-4xl">account_circle</span>
                  </div>
                  <div class="ml-3">
                    <div class="text-base font-medium leading-none text-white">{{ auth.user()?.email }}</div>
                    <div class="text-sm font-medium leading-none text-indigo-300 mt-1 capitalize">{{ auth.user()?.role }}</div>
                  </div>
                </div>
                <div class="px-2 space-y-1">
                  <button (click)="logout()" class="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-indigo-200 hover:text-white hover:bg-indigo-700">
                    Sign out
                  </button>
                </div>
              } @else {
                <div class="px-2">
                  <a routerLink="/auth" (click)="closeMobileMenu()" class="block w-full text-center px-3 py-3 rounded-md text-base font-bold bg-white text-indigo-700 hover:bg-indigo-50">
                    Sign In
                  </a>
                </div>
              }
            </div>
          </div>
        }
      </nav>

      <!-- Main Content -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="md:flex md:items-center md:justify-between">
             <div class="flex justify-center md:justify-start space-x-6 md:order-2">
               <a href="#" class="text-gray-400 hover:text-gray-300">
                 <span class="sr-only">Twitter</span>
                 <span class="material-icons text-xl">rss_feed</span>
               </a>
             </div>
             <div class="mt-8 md:mt-0 md:order-1">
               <p class="text-center md:text-left text-sm">&copy; 2024 NewsCloud SaaS Platform. All rights reserved.</p>
             </div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  auth = inject(SupabaseService);
  router: Router = inject(Router);
  mobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }

  async logout() {
    await this.auth.signOut();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }
}