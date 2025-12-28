import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleService } from '../../core/services/article.service';
import { Article } from '../../core/services/supabase-mock.service';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white min-h-screen pb-12">
      @if (article()) {
        <!-- Hero Section -->
        <div class="relative h-[400px] md:h-[500px] w-full">
          <img [src]="article()?.image_url" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-4 pb-12">
            <div class="flex items-center gap-3 mb-4">
              <span class="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {{ article()?.category }}
              </span>
              @if(article()?.status === 'draft') {
                <span class="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Draft Preview
                </span>
              }
            </div>
            <h1 class="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-sm">
              {{ article()?.title }}
            </h1>
            <div class="flex flex-col sm:flex-row sm:items-center text-gray-200 text-sm gap-4 sm:gap-8">
               <div class="flex items-center">
                 <span class="material-icons text-base mr-2">person</span>
                 <span>Author ID: {{ article()?.author_id }}</span>
               </div>
               <div class="flex items-center">
                 <span class="material-icons text-base mr-2">calendar_today</span>
                 <span>{{ article()?.created_at | date:'longDate' }}</span>
               </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="max-w-3xl mx-auto px-4 -mt-8 relative z-10">
          <div class="bg-white p-8 md:p-12 rounded-xl shadow-lg border border-gray-100">
            
            @if (article()?.excerpt) {
              <p class="text-xl text-gray-600 font-medium leading-relaxed mb-8 italic border-l-4 border-indigo-500 pl-6 py-1">
                {{ article()?.excerpt }}
              </p>
            }

            <!-- Render HTML Content safely -->
            <div class="prose prose-lg prose-indigo max-w-none text-gray-800" [innerHTML]="article()?.content"></div>

            <!-- Tags -->
            @if (article()?.tags?.length) {
              <div class="mt-12 pt-8 border-t border-gray-100">
                <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Topics</h4>
                <div class="flex flex-wrap gap-2">
                  @for (tag of article()?.tags; track tag) {
                    <span class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition cursor-pointer">
                      #{{ tag }}
                    </span>
                  }
                </div>
              </div>
            }
          </div>
          
          <!-- Navigation Footer -->
          <div class="mt-8 flex justify-between items-center">
            <a routerLink="/articles" class="inline-flex items-center text-gray-600 hover:text-indigo-600 font-medium transition">
              <span class="material-icons mr-2">arrow_back</span> Back to News
            </a>
          </div>
        </div>
      } @else {
        <div class="flex justify-center items-center h-screen">
           <div class="flex flex-col items-center gap-4">
             <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
             <p class="text-gray-500">Loading article...</p>
           </div>
        </div>
      }
    </div>
  `
})
export class ArticleDetailComponent implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  articleService = inject(ArticleService);
  article = signal<Article | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.articleService.getArticleById(id).subscribe(data => {
        if (data) this.article.set(data);
      });
    }
  }
}