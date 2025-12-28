
import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from './services/article.service';
import { Article } from '../../core/services/supabase-mock.service';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- HERO SLIDER -->
      @if (!loading() && sliderArticles().length > 0) {
        <div class="relative w-full h-[400px] md:h-[500px] rounded-sm overflow-hidden mb-12 group bg-gray-900 shadow-xl">
           <!-- Slides -->
           @for (slide of sliderArticles(); track slide.id; let i = $index) {
             <div class="absolute inset-0 transition-opacity duration-700 ease-in-out"
                  [class.opacity-0]="currentSlide() !== i"
                  [class.opacity-100]="currentSlide() === i"
                  [class.pointer-events-none]="currentSlide() !== i">
                <img [src]="slide.image_url" class="absolute inset-0 w-full h-full object-cover opacity-80">
                <!-- Gradient Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                
                <!-- Content -->
                <div class="absolute bottom-0 left-0 p-6 md:p-12 max-w-4xl z-10">
                   <div class="flex items-center gap-3 mb-4">
                     <span class="inline-block px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase bg-[#b91c1c]">
                       {{ slide.category }}
                     </span>
                     <span class="text-gray-300 text-xs uppercase tracking-wide font-medium">
                       {{ slide.created_at | date:'longDate' }}
                     </span>
                   </div>
                   <h2 class="text-3xl md:text-5xl font-serif font-bold text-white mb-4 leading-tight drop-shadow-lg">
                     <a [routerLink]="['/articles', slide.id]" class="hover:text-[#c5a065] transition-colors">{{ slide.title }}</a>
                   </h2>
                   <p class="text-gray-200 text-sm md:text-lg line-clamp-2 mb-6 font-serif max-w-2xl leading-relaxed">
                     {{ slide.excerpt }}
                   </p>
                   <a [routerLink]="['/articles', slide.id]" class="inline-flex items-center text-white text-sm font-bold uppercase tracking-widest group/link hover:text-[#c5a065] transition">
                     Read Full Story <span class="material-icons text-sm ml-2 group-hover/link:translate-x-1 transition-transform">arrow_forward</span>
                   </a>
                </div>
             </div>
           }

           <!-- Controls -->
           <button (click)="prevSlide()" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-[#b91c1c] text-white p-3 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100 z-20 border border-white/20">
             <span class="material-icons">chevron_left</span>
           </button>
           <button (click)="nextSlide()" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-[#b91c1c] text-white p-3 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100 z-20 border border-white/20">
             <span class="material-icons">chevron_right</span>
           </button>
           
           <!-- Indicators -->
           <div class="absolute bottom-8 right-8 flex space-x-2 z-20">
             @for (slide of sliderArticles(); track slide.id; let i = $index) {
               <button (click)="setSlide(i)" 
                       class="h-1 rounded-full transition-all duration-300 shadow-sm"
                       [class.bg-[#c5a065]]="currentSlide() === i"
                       [class.w-8]="currentSlide() === i"
                       [class.bg-white/40]="currentSlide() !== i"
                       [class.w-4]="currentSlide() !== i">
               </button>
             }
           </div>
        </div>
      }

      <!-- MAIN CONTENT TABS & FILTERS -->
      <div class="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-gray-100 mb-8 pb-0 gap-6">
        <!-- View Tabs -->
        <div class="flex space-x-8">
           <button (click)="setViewMode('latest')" 
                   class="pb-4 text-xl font-serif font-black uppercase tracking-wider border-b-4 transition-colors duration-300 -mb-[2px]"
                   [class.border-[#b91c1c]]="viewMode() === 'latest'"
                   [class.text-gray-900]="viewMode() === 'latest'"
                   [class.border-transparent]="viewMode() !== 'latest'"
                   [class.text-gray-400]="viewMode() !== 'latest'">
              Latest News
           </button>
           <button (click)="setViewMode('trending')" 
                   class="pb-4 text-xl font-serif font-black uppercase tracking-wider border-b-4 transition-colors duration-300 -mb-[2px]"
                   [class.border-[#c5a065]]="viewMode() === 'trending'"
                   [class.text-gray-900]="viewMode() === 'trending'"
                   [class.border-transparent]="viewMode() !== 'trending'"
                   [class.text-gray-400]="viewMode() !== 'trending'">
              Trending Now
           </button>
        </div>
        
        <!-- Category Filter Pills -->
        <nav class="flex space-x-2 overflow-x-auto pb-4 md:pb-3 scrollbar-hide">
          <button (click)="setCategory('All')" 
                  [class.bg-gray-900]="activeCategory() === 'All'"
                  [class.text-white]="activeCategory() === 'All'"
                  [class.bg-gray-100]="activeCategory() !== 'All'"
                  [class.text-gray-600]="activeCategory() !== 'All'"
                  class="px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition whitespace-nowrap hover:bg-gray-800 hover:text-white">
            All
          </button>
          @for (cat of categories; track cat) {
            <button (click)="setCategory(cat)"
                  [class.bg-gray-900]="activeCategory() === cat"
                  [class.text-white]="activeCategory() === cat"
                  [class.bg-gray-100]="activeCategory() !== cat"
                  [class.text-gray-600]="activeCategory() !== cat"
                  class="px-4 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-widest transition whitespace-nowrap hover:bg-gray-800 hover:text-white">
              {{ cat }}
            </button>
          }
        </nav>
      </div>

      <!-- Articles Grid -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          @for (item of [1,2,3,4,5,6]; track item) {
            <div class="animate-pulse">
              <div class="bg-gray-200 h-64 w-full mb-4 rounded-sm"></div>
              <div class="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
              <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          @for (article of filteredArticles(); track article.id) {
            <article class="flex flex-col h-full group">
              <div class="relative h-64 w-full overflow-hidden mb-5 bg-gray-100">
                <img [src]="article.image_url || 'https://picsum.photos/400/300'" class="object-cover w-full h-full transform group-hover:scale-105 transition duration-700 ease-out" alt="Article Image">
                <a [routerLink]="['/articles', article.id]" class="absolute inset-0 z-10"></a>
                <span class="absolute top-0 left-0 bg-[#c5a065] text-white text-[10px] px-3 py-1 font-bold uppercase tracking-widest">
                  {{ article.category }}
                </span>
              </div>
              
              <div class="flex-1 flex flex-col">
                <div class="mb-2 flex items-center text-xs text-gray-500 font-medium uppercase tracking-wide">
                   <span class="text-[#b91c1c] mr-2" *ngIf="viewMode() === 'trending'">Trending</span>
                   <span *ngIf="viewMode() === 'trending'" class="mr-2 text-gray-300">|</span>
                   <span>{{ article.created_at | date:'mediumDate' }}</span>
                </div>
                
                <h3 class="text-xl font-serif font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#b91c1c] transition-colors">
                  <a [routerLink]="['/articles', article.id]">{{ article.title }}</a>
                </h3>
                
                <p class="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 font-serif">
                  {{ article.excerpt || (article.content | slice:0:150) }}...
                </p>
                
                <div class="mt-auto pt-4 border-t border-gray-100">
                   <a [routerLink]="['/articles', article.id]" class="text-xs font-bold uppercase tracking-widest text-gray-900 hover:text-[#b91c1c] transition flex items-center">
                     Read Article <span class="material-icons text-sm ml-1">arrow_right_alt</span>
                   </a>
                </div>
              </div>
            </article>
          } @empty {
            <div class="col-span-full py-20 text-center bg-gray-50 border border-gray-100 rounded-lg">
              <span class="material-icons text-5xl text-gray-300 mb-4">newspaper</span>
              <p class="text-gray-500 text-lg font-serif">No articles found in this section.</p>
              <button (click)="setCategory('All')" class="mt-4 text-indigo-600 hover:text-indigo-800 font-medium text-sm uppercase tracking-wide">View All News</button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ArticleListComponent implements OnInit, OnDestroy {
  articleService = inject(ArticleService);
  
  categories = ['Technology', 'Finance', 'Health', 'Politics', 'Sports', 'Culture'];
  
  // State Signals
  activeCategory = signal('All');
  viewMode = signal<'latest' | 'trending'>('latest');
  articles = signal<Article[]>([]);
  loading = signal(true);
  
  // Slider State
  currentSlide = signal(0);
  sliderTimer: any;

  // Derived State
  sliderArticles = computed(() => {
    // Top 5 published articles for slider
    return this.articles()
      .filter(a => a.status === 'published')
      .slice(0, 5);
  });

  filteredArticles = computed(() => {
    let list = this.articles().filter(a => a.status === 'published');
    
    // 1. Filter by Category
    const cat = this.activeCategory();
    if (cat !== 'All') {
      list = list.filter(a => a.category === cat);
    }

    // 2. Sort/Filter by View Mode
    if (this.viewMode() === 'trending') {
        // Mock Trending: Sort by Title length (Simulating engagement metric) and prioritize certain categories
        list = [...list].sort((a, b) => {
           // Bias towards Sports and Finance for trending demo
           const isTrendA = ['Sports', 'Finance'].includes(a.category);
           const isTrendB = ['Sports', 'Finance'].includes(b.category);
           if (isTrendA && !isTrendB) return -1;
           if (!isTrendA && isTrendB) return 1;
           return b.title.length - a.title.length; // Secondary sort
        });
    } else {
        // Latest: Sort by Date Descending
        list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  });

  ngOnInit() {
    this.loading.set(true);
    this.articleService.getArticles('published').subscribe({
      next: (data) => {
        this.articles.set(data);
        this.loading.set(false);
        this.startSlider();
      },
      error: (err) => {
        console.error('Failed to load articles', err);
        this.loading.set(false);
      }
    });
  }

  ngOnDestroy() {
    this.stopSlider();
  }

  // --- Slider Logic ---
  startSlider() {
    this.stopSlider();
    this.sliderTimer = setInterval(() => {
      this.nextSlide();
    }, 5000); // 5 seconds auto-play
  }

  stopSlider() {
    if (this.sliderTimer) {
      clearInterval(this.sliderTimer);
    }
  }

  nextSlide() {
    const total = this.sliderArticles().length;
    if (total === 0) return;
    this.currentSlide.update(c => (c + 1) % total);
  }

  prevSlide() {
    const total = this.sliderArticles().length;
    if (total === 0) return;
    this.currentSlide.update(c => (c - 1 + total) % total);
  }

  setSlide(index: number) {
    this.currentSlide.set(index);
    this.startSlider(); // Reset timer
  }

  // --- Tab & Filter Logic ---
  setCategory(cat: string) {
    this.activeCategory.set(cat);
  }

  setViewMode(mode: 'latest' | 'trending') {
    this.viewMode.set(mode);
    this.activeCategory.set('All'); // Reset category when switching tabs for better UX
  }
}
