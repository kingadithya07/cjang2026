
import { Component, inject, OnInit, signal, computed } from '@angular/core';
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
      
      <!-- Category Filter -->
      <div class="mb-10 overflow-x-auto pb-2">
        <nav class="flex space-x-4 border-b border-gray-200" aria-label="Tabs">
          <button 
            (click)="setCategory('All')"
            [class.border-indigo-500]="activeCategory() === 'All'"
            [class.text-indigo-600]="activeCategory() === 'All'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition">
            All News
          </button>
          @for (cat of categories; track cat) {
            <button 
              (click)="setCategory(cat)"
              [class.border-indigo-500]="activeCategory() === cat"
              [class.text-indigo-600]="activeCategory() === cat"
              class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition">
              {{ cat }}
            </button>
          }
        </nav>
      </div>

      <!-- Articles Grid -->
      @if (loading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (item of [1,2,3]; track item) {
            <div class="animate-pulse bg-white rounded-lg shadow h-96">
              <div class="bg-gray-200 h-48 rounded-t-lg"></div>
              <div class="p-6 space-y-4">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                <div class="h-24 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (article of filteredArticles(); track article.id) {
            <article class="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden border border-gray-100 h-full">
              <div class="relative h-56 w-full overflow-hidden group">
                <img [src]="article.image_url || 'https://picsum.photos/400/300'" class="object-cover w-full h-full transform group-hover:scale-105 transition duration-500" alt="Article Image">
                <span class="absolute top-4 left-4 bg-white/90 text-gray-900 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide shadow-sm">
                  {{ article.category }}
                </span>
              </div>
              <div class="flex-1 p-6 flex flex-col">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 mb-2 leading-tight hover:text-indigo-600 transition">
                    <a [routerLink]="['/articles', article.id]">{{ article.title }}</a>
                  </h3>
                  <p class="text-gray-500 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {{ article.excerpt || (article.content | slice:0:150) }}...
                  </p>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div class="flex items-center text-xs text-gray-500">
                    <span class="material-icons text-sm mr-1">calendar_today</span>
                    {{ article.created_at | date:'mediumDate' }}
                  </div>
                  <a [routerLink]="['/articles', article.id]" class="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center group">
                    Read 
                    <span class="material-icons text-base ml-1 transform group-hover:translate-x-1 transition">arrow_forward</span>
                  </a>
                </div>
              </div>
            </article>
          } @empty {
            <div class="col-span-full text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-200">
              <span class="material-icons text-4xl text-gray-300 mb-2">newspaper</span>
              <p class="text-gray-500">No articles found in this category.</p>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ArticleListComponent implements OnInit {
  articleService = inject(ArticleService);
  
  categories = ['Technology', 'Finance', 'Health', 'Politics', 'Lifestyle', 'Sports'];
  activeCategory = signal('All');
  articles = signal<Article[]>([]);
  loading = signal(true);

  filteredArticles = computed(() => {
    // Only show published articles in public list
    const all = this.articles().filter(a => a.status === 'published');
    const cat = this.activeCategory();
    if (cat === 'All') return all;
    return all.filter(a => a.category === cat);
  });

  ngOnInit() {
    this.loading.set(true);
    // Subscribe to the Observable
    this.articleService.getArticles('published').subscribe({
      next: (data) => {
        this.articles.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load articles', err);
        this.loading.set(false);
      }
    });
  }

  setCategory(cat: string) {
    this.activeCategory.set(cat);
  }
}
