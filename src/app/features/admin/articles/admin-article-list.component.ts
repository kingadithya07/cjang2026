import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { Article } from '../../../core/services/supabase-mock.service';

@Component({
  selector: 'app-admin-article-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Article Management</h1>
          <p class="text-sm text-gray-500 mt-1">Manage content, SEO, and publication status.</p>
        </div>
        <a routerLink="/admin/articles/new" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
          <span class="material-icons mr-2 text-base">add</span>
          Create New
        </a>
      </div>

      <div class="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200" aria-label="Articles Table">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" class="relative px-6 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @if (loading()) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr class="animate-pulse">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="h-10 w-10 bg-gray-200 rounded"></div>
                        <div class="ml-4 space-y-2">
                          <div class="h-4 bg-gray-200 rounded w-48"></div>
                          <div class="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4"><div class="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td class="px-6 py-4"><div class="h-6 bg-gray-200 rounded-full w-16"></div></td>
                    <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-12"></div></td>
                    <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td class="px-6 py-4 text-right"><div class="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                }
              } @else {
                @for (article of articles(); track article.id) {
                  <tr class="hover:bg-gray-50 transition group">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                          <img class="h-10 w-10 rounded object-cover shadow-sm" [src]="article.image_url || 'https://picsum.photos/100/100'" alt="">
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900 truncate max-w-xs group-hover:text-indigo-600 transition" [title]="article.title">
                            <a [routerLink]="['/admin/articles', article.id]">{{ article.title }}</a>
                          </div>
                          <div class="text-xs text-gray-500 font-mono">/{{ article.slug }}</div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {{ article.category }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full border" 
                            [class.bg-green-50]="article.status === 'published'"
                            [class.text-green-700]="article.status === 'published'"
                            [class.border-green-200]="article.status === 'published'"
                            [class.bg-amber-50]="article.status === 'draft'"
                            [class.text-amber-700]="article.status === 'draft'"
                            [class.border-amber-200]="article.status === 'draft'">
                        <span class="w-1.5 h-1.5 rounded-full mr-1.5 mt-1" 
                              [class.bg-green-500]="article.status === 'published'"
                              [class.bg-amber-500]="article.status === 'draft'"></span>
                        {{ article.status | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span class="bg-gray-100 text-gray-600 py-0.5 px-2 rounded text-xs">ID: {{ article.author_id }}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ article.created_at | date:'MMM d, y' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a [routerLink]="['/admin/articles', article.id]" class="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center">
                        <span class="material-icons text-sm mr-1">edit</span> Edit
                      </a>
                      <button (click)="deleteArticle(article.id)" class="text-red-600 hover:text-red-900 inline-flex items-center">
                        <span class="material-icons text-sm mr-1">delete</span> Delete
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-16 text-center text-gray-500">
                      <span class="material-icons text-4xl text-gray-300 mb-2">inbox</span>
                      <p>No articles found.</p>
                      <a routerLink="/admin/articles/new" class="text-indigo-600 hover:underline text-sm mt-2 inline-block">Create your first article</a>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminArticleListComponent implements OnInit {
  articleService = inject(ArticleService);
  articles = signal<Article[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles() {
    this.loading.set(true);
    // Simulate network delay for skeleton demo
    setTimeout(() => {
        this.articleService.getArticles().subscribe(data => {
            this.articles.set(data);
            this.loading.set(false);
        });
    }, 800);
  }

  deleteArticle(id: string) {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(id).subscribe(() => {
        this.loadArticles(); // Reload list
      });
    }
  }
}