
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { SupabaseService } from './core/services/supabase-mock.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen flex flex-col bg-white font-serif">
      
      <!-- PART 1: Top Bar & Header (Sticky on Desktop, Static on Mobile) -->
      <div class="md:sticky md:top-0 md:z-50 bg-white relative z-30">
        
        <!-- 1. Top Bar -->
        <div class="border-b border-gray-200 bg-gray-50 text-gray-500 text-xs py-1.5 px-4 sm:px-6 lg:px-8 font-sans">
          <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="flex items-center gap-4">
              <span class="font-bold text-gray-700 uppercase tracking-wide">{{ now() | date:'d MMMM y' | uppercase }}</span>
              <span class="hidden sm:inline text-gray-300">|</span>
              <span class="hidden sm:inline flex items-center gap-1">
                <span class="material-icons text-[14px] text-gray-400">schedule</span>
                <span class="tracking-wide">INDIA: {{ now() | date:'h:mm:ss a' }}</span>
              </span>
            </div>
            <div class="flex items-center gap-4">
               @if (auth.user()) {
                  <div class="hidden sm:flex items-center gap-2">
                    <span>Welcome, {{ auth.user()?.email }}</span>
                    <span class="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border"
                          [class.bg-indigo-50]="auth.user()?.role === 'admin'"
                          [class.text-indigo-700]="auth.user()?.role === 'admin'"
                          [class.border-indigo-200]="auth.user()?.role === 'admin'"
                          [class.bg-emerald-50]="auth.user()?.role === 'editor'"
                          [class.text-emerald-700]="auth.user()?.role === 'editor'"
                          [class.border-emerald-200]="auth.user()?.role === 'editor'"
                          [class.bg-gray-100]="auth.user()?.role === 'reader'"
                          [class.text-gray-600]="auth.user()?.role === 'reader'"
                          [class.border-gray-200]="auth.user()?.role === 'reader'">
                      {{ auth.user()?.role }}
                    </span>
                  </div>
                  <button (click)="logout()" class="hover:text-red-700 font-bold uppercase transition flex items-center gap-1" title="Logout">
                    <span class="material-icons text-[16px]">logout</span> Logout
                  </button>
               } @else {
                  <a routerLink="/auth" class="hover:text-gray-900 font-bold uppercase transition flex items-center gap-1 text-gray-600" title="Login">
                    <span class="material-icons text-[16px]">login</span> Login
                  </a>
               }
            </div>
          </div>
        </div>

        <!-- 2. Main Header -->
        <header class="py-6 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            
            <!-- Spacer (Left) -->
            <div class="hidden md:block w-1/4 order-1"></div>

            <!-- Logo (Center) -->
            <div class="text-center order-1 md:order-2 flex-grow">
              <a routerLink="/" class="block group" title="CJNewsHub Home">
                <h1 class="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none font-serif">
                  CJ<span class="text-[#c5a065]">NEWS</span>HUB
                </h1>
                <div class="flex items-center justify-center gap-4 mt-3">
                  <div class="h-px bg-gray-300 w-8 md:w-16"></div>
                  <p class="text-[10px] md:text-xs tracking-[0.3em] font-sans font-bold text-gray-500 uppercase">Est. 2025 • Global Edition</p>
                  <div class="h-px bg-gray-300 w-8 md:w-16"></div>
                </div>
              </a>
            </div>

            <!-- Subscribe Button (Right - Desktop Only) -->
            <div class="hidden md:flex w-1/4 order-3 justify-end">
               <button class="bg-[#b91c1c] hover:bg-[#991b1b] text-white text-xs md:text-sm font-sans font-bold py-2.5 px-6 rounded-sm shadow-sm transition uppercase tracking-widest transform hover:-translate-y-0.5" title="Subscribe Now">
                 Subscribe Now
               </button>
            </div>
          </div>
        </header>

      </div>
      
      <!-- PART 2: Nav & Ticker (Sticky on Mobile & Desktop) -->
      <!-- Desktop top offset calculated approx 11.5rem (184px) to sit below Header -->
      <div class="sticky top-0 z-40 md:sticky md:top-[11.5rem] bg-white shadow-lg">
        
        <!-- 3. Navigation -->
        <div class="bg-white border-y border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <!-- Desktop Nav -->
            <nav class="hidden md:flex justify-center items-center space-x-8 py-3 font-serif" aria-label="Main Navigation">
               <a routerLink="/" class="text-2xl font-black text-gray-900 tracking-tight leading-none mr-4 hover:opacity-80 transition md:hidden lg:hidden" title="Home">
                 CJ
               </a>
               
               <a routerLink="/" routerLinkActive="text-[#b91c1c] border-[#b91c1c]" [routerLinkActiveOptions]="{exact: true}" class="text-gray-800 hover:text-[#b91c1c] font-bold text-sm tracking-widest uppercase transition border-b-2 border-transparent pb-1" title="Home">Home</a>
               <a routerLink="/epaper" routerLinkActive="text-[#b91c1c] border-[#b91c1c]" class="text-gray-800 hover:text-[#b91c1c] font-bold text-sm tracking-widest uppercase transition border-b-2 border-transparent pb-1 flex items-center gap-1" title="E-Paper">
                 <span class="material-icons text-base">newspaper</span> E-Paper
               </a>
               <a routerLink="/articles" routerLinkActive="text-[#b91c1c] border-[#b91c1c]" class="text-gray-800 hover:text-[#b91c1c] font-bold text-sm tracking-widest uppercase transition border-b-2 border-transparent pb-1" title="Classifieds">Classifieds</a>
               <a routerLink="/articles" routerLinkActive="text-[#b91c1c] border-[#b91c1c]" class="text-gray-800 hover:text-[#b91c1c] font-bold text-sm tracking-widest uppercase transition border-b-2 border-transparent pb-1" title="World News">World</a>
               <a routerLink="/articles" routerLinkActive="text-[#b91c1c] border-[#b91c1c]" class="text-gray-800 hover:text-[#b91c1c] font-bold text-sm tracking-widest uppercase transition border-b-2 border-transparent pb-1" title="Business">Business</a>
               <a routerLink="/articles" routerLinkActive="text-[#b91c1c] border-[#b91c1c]" class="text-gray-800 hover:text-[#b91c1c] font-bold text-sm tracking-widest uppercase transition border-b-2 border-transparent pb-1" title="Technology">Technology</a>
               <a routerLink="/articles" routerLinkActive="text-[#b91c1c] border-[#b91c1c]" class="text-gray-800 hover:text-[#b91c1c] font-bold text-sm tracking-widest uppercase transition border-b-2 border-transparent pb-1" title="Culture">Culture</a>
               <a routerLink="/articles" routerLinkActive="text-[#b91c1c] border-[#b91c1c]" class="text-gray-800 hover:text-[#b91c1c] font-bold text-sm tracking-widest uppercase transition border-b-2 border-transparent pb-1" title="Sports">Sports</a>

               <!-- Removed Login Link Here -->

               @if (auth.user()?.role === 'admin') {
                  <a routerLink="/admin" routerLinkActive="text-[#b91c1c] border-[#b91c1c]" class="text-indigo-800 hover:text-indigo-600 font-bold text-sm tracking-widest uppercase transition border-b-2 border-transparent pb-1 ml-4" title="Admin Console">Admin</a>
               }
            </nav>

            <!-- Mobile Header (Hamburger & Icons) -->
            <div class="md:hidden flex justify-between items-center py-2">
               <!-- Brand Name (Left) -->
               <a routerLink="/" class="text-xl font-black text-gray-900 tracking-tight leading-none font-serif" title="Home">
                 CJ<span class="text-[#c5a065]">NEWS</span>HUB
               </a>

               <!-- Icons & Menu (Right) -->
               <div class="flex items-center gap-1">
                 <a routerLink="/" routerLinkActive="text-[#b91c1c]" [routerLinkActiveOptions]="{exact: true}" class="text-gray-700 p-2 hover:text-[#b91c1c] transition" title="Home">
                   <span class="material-icons text-[20px]">home</span>
                 </a>
                 <a routerLink="/epaper" routerLinkActive="text-[#b91c1c]" class="text-gray-700 p-2 hover:text-[#b91c1c] transition" title="E-Paper">
                   <span class="material-icons text-[20px]">newspaper</span>
                 </a>

                 <button class="text-gray-700 p-2 hover:text-[#b91c1c] transition" title="Subscribe">
                   <span class="material-icons text-[20px]">card_membership</span>
                 </button>
                 
                 @if (auth.user()) {
                   <a routerLink="/admin" routerLinkActive="text-[#b91c1c]" class="text-gray-700 p-2 hover:text-[#b91c1c] transition" title="My Account">
                     <span class="material-icons text-[20px]">account_circle</span>
                   </a>
                 } @else {
                   <a routerLink="/auth" routerLinkActive="text-[#b91c1c]" class="text-gray-700 p-2 hover:text-[#b91c1c] transition" title="Login">
                     <span class="material-icons text-[20px]">login</span>
                   </a>
                 }
                 
                 <button (click)="toggleMobileMenu()" class="text-gray-900 focus:outline-none p-2 ml-1 hover:bg-gray-100 rounded-full transition" title="Menu">
                   <span class="material-icons text-2xl">{{ mobileMenuOpen() ? 'close' : 'menu' }}</span>
                 </button>
               </div>
            </div>
          </div>

          <!-- Mobile Menu Dropdown -->
          @if (mobileMenuOpen()) {
             <div class="md:hidden bg-white border-t border-gray-100 shadow-inner max-h-[80vh] overflow-y-auto">
               <div class="px-4 py-2 space-y-1">
                 <a routerLink="/articles" (click)="closeMobileMenu()" class="block py-3 text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 font-serif">World</a>
                 <a routerLink="/articles" (click)="closeMobileMenu()" class="block py-3 text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 font-serif">Business</a>
                 <a routerLink="/articles" (click)="closeMobileMenu()" class="block py-3 text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-100 font-serif">Technology</a>

                 @if (auth.user()?.role === 'admin') {
                   <a routerLink="/admin" (click)="closeMobileMenu()" class="block py-3 text-sm font-bold text-indigo-700 uppercase tracking-widest font-serif">Admin Console</a>
                 }
               </div>
             </div>
          }
        </div>

        <!-- 4. Breaking News Ticker -->
        <div class="bg-gray-900 text-white text-sm font-sans relative z-40 border-b border-gray-800">
          <div class="max-w-7xl mx-auto flex items-stretch h-10">
            <div class="bg-[#c5a065] text-black font-extrabold px-4 md:px-6 flex items-center uppercase tracking-wider text-[10px] md:text-xs z-20 shrink-0">
              <span class="material-icons text-sm mr-2 animate-pulse">local_fire_department</span>
              Breaking
            </div>
            <div class="flex-1 flex items-center overflow-hidden relative bg-black/50">
              <div class="animate-marquee whitespace-nowrap flex gap-12 text-gray-300 text-xs md:text-sm font-medium uppercase tracking-wide px-4">
                <span class="flex items-center"><span class="text-[#c5a065] font-bold mr-3">Business</span> Global Markets Rally as Tech Sector Rebounds Unexpectedly <span class="ml-3 text-gray-600">+++</span></span>
                <span class="flex items-center"><span class="text-[#c5a065] font-bold mr-3">Culture</span> The Renaissance of Modern Architecture in Europe <span class="ml-3 text-gray-600">+++</span></span>
                <span class="flex items-center"><span class="text-[#c5a065] font-bold mr-3">Technology</span> New AI Regulations Proposed by EU Commission <span class="ml-3 text-gray-600">+++</span></span>
                 <span class="flex items-center"><span class="text-[#c5a065] font-bold mr-3">Sports</span> Championship Finals set for next Sunday <span class="ml-3 text-gray-600">+++</span></span>
              </div>
              <!-- Fade edges -->
              <div class="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-gray-900 to-transparent z-10"></div>
              <div class="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
            </div>
          </div>
        </div>

      </div> 
      <!-- END STICKY CONTAINER -->

      <!-- 5. Ad Banner Placeholder -->
      <div class="bg-[#f8f9fa] py-12 border-b border-gray-200">
         <div class="max-w-7xl mx-auto px-4">
             <div class="flex justify-end mb-2">
                <span class="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-sans font-medium">Premium Global Partners</span>
             </div>
             <div class="w-full h-32 md:h-48 bg-gray-200 overflow-hidden relative group cursor-pointer shadow-inner">
               <img src="https://picsum.photos/1200/200?grayscale&blur=2" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition duration-1000" alt="Advertisement">
               <div class="absolute inset-0 flex items-center justify-center">
                  <div class="bg-white/90 backdrop-blur-sm px-6 py-3 border border-gray-300 shadow-sm">
                    <span class="text-xs font-bold tracking-[0.2em] text-gray-600 uppercase">Advertisement Space</span>
                  </div>
               </div>
             </div>
         </div>
      </div>

      <!-- Main Content -->
      <main class="flex-grow font-sans bg-white relative z-0">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="bg-white text-gray-600 py-16 border-t-4 border-[#c5a065]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
             <div class="col-span-1 md:col-span-1">
                <h2 class="text-3xl font-serif font-black text-gray-900 tracking-tight leading-none mb-6">
                  CJ<span class="text-[#c5a065]">NEWS</span>HUB
                </h2>
                <p class="text-xs leading-relaxed text-gray-600 font-serif">
                  Delivering impartial, fact-based reporting from around the globe since 2025. Your trusted source for breaking news and in-depth analysis.
                </p>
                <div class="mt-6 flex gap-4">
                  <a href="#" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#c5a065] hover:text-black text-gray-800 transition" title="Facebook"><span class="material-icons text-sm">facebook</span></a>
                  <a href="#" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#c5a065] hover:text-black text-gray-800 transition" title="RSS Feed"><span class="material-icons text-sm">rss_feed</span></a>
                </div>
             </div>
             <div>
                <h3 class="text-gray-900 text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2 inline-block">Sections</h3>
                <ul class="space-y-3 text-xs tracking-wide">
                  <li><a href="#" class="hover:text-[#c5a065] transition block py-1 border-b border-gray-100">World News</a></li>
                  <li><a href="#" class="hover:text-[#c5a065] transition block py-1 border-b border-gray-100">Global Economy</a></li>
                  <li><a href="#" class="hover:text-[#c5a065] transition block py-1 border-b border-gray-100">Technology</a></li>
                  <li><a href="#" class="hover:text-[#c5a065] transition block py-1 border-b border-gray-100">Arts & Culture</a></li>
                </ul>
             </div>
             <div>
                <h3 class="text-gray-900 text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2 inline-block">Company</h3>
                <ul class="space-y-3 text-xs tracking-wide">
                  <li><a href="#" class="hover:text-[#c5a065] transition block py-1 border-b border-gray-100">About Us</a></li>
                  <li><a href="#" class="hover:text-[#c5a065] transition block py-1 border-b border-gray-100">Work With Us</a></li>
                  <li><a href="#" class="hover:text-[#c5a065] transition block py-1 border-b border-gray-100">Code of Ethics</a></li>
                  <li><a href="#" class="hover:text-[#c5a065] transition block py-1 border-b border-gray-100">Contact Support</a></li>
                </ul>
             </div>
             <div>
               <h3 class="text-gray-900 text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2 inline-block">Newsletter</h3>
               <p class="text-xs text-gray-500 mb-4">Get the latest headlines delivered to your inbox daily.</p>
               <div class="flex flex-col gap-3">
                 <input type="email" placeholder="Email address" class="bg-gray-50 border border-gray-300 text-gray-900 text-xs p-3 focus:outline-none focus:border-[#c5a065] transition placeholder-gray-400">
                 <button class="bg-black text-white text-xs font-bold uppercase py-3 hover:bg-[#c5a065] hover:text-black transition tracking-widest">Sign Up</button>
               </div>
             </div>
           </div>
           <div class="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 uppercase tracking-wider">
              <p>&copy; 2025 CJNewsHub Media Group. All rights reserved.</p>
              <div class="flex gap-6 mt-4 md:mt-0">
                 <a href="#" class="hover:text-[#c5a065] transition">Privacy Policy</a>
                 <a href="#" class="hover:text-[#c5a065] transition">Terms of Service</a>
                 <a href="#" class="hover:text-[#c5a065] transition">Cookie Preferences</a>
              </div>
           </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      animation: marquee 40s linear infinite;
    }
    .animate-marquee:hover {
      animation-play-state: paused;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  auth = inject(SupabaseService);
  router: Router = inject(Router);
  mobileMenuOpen = signal(false);
  now = signal(new Date());
  private timer: any;

  ngOnInit() {
    // Update time every second
    this.timer = setInterval(() => {
      this.now.set(new Date());
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

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
