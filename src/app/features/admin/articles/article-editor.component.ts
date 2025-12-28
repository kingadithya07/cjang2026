import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../../core/services/article.service';
import { SupabaseService, Article } from '../../../core/services/supabase-mock.service';
import { RichTextEditorComponent } from '../../../shared/ui/rich-text-editor.component';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RichTextEditorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">
      <form [formGroup]="form" (ngSubmit)="save()">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ isEditing() ? 'Edit Article' : 'New Article' }}</h2>
            <p class="text-sm text-gray-500">Fill in the details below to publish your story.</p>
          </div>
          <div class="flex gap-4">
            <button type="button" (click)="cancel()" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" [disabled]="form.invalid || saving()" class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition flex items-center">
              @if (saving()) {
                <span class="material-icons animate-spin text-sm mr-2">refresh</span>
              }
              {{ isEditing() ? 'Update' : 'Publish' }}
            </button>
          </div>
        </div>
        
        @if (error()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {{ error() }}
          </div>
        }
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Article Title</label>
                <input formControlName="title" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium" placeholder="Enter an engaging title...">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input formControlName="slug" type="text" class="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50 text-gray-600 font-mono" placeholder="auto-generated-slug">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <app-rich-text-editor formControlName="content"></app-rich-text-editor>
                @if (form.get('content')?.touched && form.get('content')?.invalid) {
                  <p class="text-xs text-red-500 mt-1">Content is required</p>
                }
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea formControlName="excerpt" rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm" placeholder="A short summary for list views..."></textarea>
              </div>
            </div>

            <!-- SEO Settings -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <h3 class="text-lg font-medium text-gray-900 border-b pb-2">SEO Settings</h3>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input formControlName="meta_title" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                <p class="text-xs text-gray-400 mt-1">Recommended length: 50-60 characters</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea formControlName="meta_description" rows="2" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"></textarea>
                <p class="text-xs text-gray-400 mt-1">Recommended length: 150-160 characters</p>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select formControlName="status" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select formControlName="category" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance</option>
                  <option value="Health">Health</option>
                  <option value="Politics">Politics</option>
                  <option value="Lifestyle">Lifestyle</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input #tagInput type="text" (keydown.enter)="$event.preventDefault(); addTag(tagInput.value); tagInput.value = ''" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm mb-2" placeholder="Press Enter to add tags">
                <div class="flex flex-wrap gap-2">
                  @for (tag of tags(); track tag) {
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {{ tag }}
                      <button type="button" (click)="removeTag(tag)" class="ml-1 text-indigo-600 hover:text-indigo-900 focus:outline-none">×</button>
                    </span>
                  }
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                <input formControlName="image_url" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                <div class="mt-2 rounded-lg overflow-hidden border border-gray-200 h-32 bg-gray-50 flex items-center justify-center">
                  @if (form.get('image_url')?.value) {
                    <img [src]="form.get('image_url')?.value" class="h-full w-full object-cover">
                  } @else {
                    <span class="text-gray-400 text-xs">Preview</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  `
})
export class ArticleEditorComponent implements OnInit {
  fb = inject(FormBuilder);
  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);
  articleService = inject(ArticleService);
  auth = inject(SupabaseService);

  saving = signal(false);
  isEditing = signal(false);
  error = signal<string | null>(null);
  tags = signal<string[]>([]);
  articleId: string | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    slug: [''],
    content: ['', [Validators.required]],
    excerpt: [''],
    category: ['Technology', Validators.required],
    status: ['draft', Validators.required],
    image_url: ['https://picsum.photos/800/400'],
    meta_title: [''],
    meta_description: ['']
  });

  constructor() {
    this.form.get('title')?.valueChanges.subscribe(title => {
      if (title && !this.isEditing()) {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        this.form.get('slug')?.setValue(slug, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.articleId = this.route.snapshot.paramMap.get('id');
    if (this.articleId && this.articleId !== 'new') {
      this.isEditing.set(true);
      this.loadArticle(this.articleId);
    }
  }

  loadArticle(id: string) {
    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        if (article) {
          this.form.patchValue(article);
          if (article.tags) {
            this.tags.set(article.tags);
          }
        }
      },
      error: (err) => this.error.set('Failed to load article.')
    });
  }

  addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !this.tags().includes(trimmed)) {
      this.tags.update(t => [...t, trimmed]);
    }
  }

  removeTag(tag: string) {
    this.tags.update(t => t.filter(x => x !== tag));
  }

  save() {
    if (this.form.invalid) return;

    this.saving.set(true);
    this.error.set(null);
    
    const val = this.form.value;

    const formData: Partial<Article> = {
      title: val.title ?? undefined,
      slug: val.slug ?? undefined,
      content: val.content ?? undefined,
      excerpt: val.excerpt ?? undefined,
      category: val.category ?? undefined,
      status: (val.status as 'draft' | 'published') ?? 'draft',
      image_url: val.image_url ?? undefined,
      meta_title: val.meta_title ?? undefined,
      meta_description: val.meta_description ?? undefined,
      tags: this.tags(),
      author_id: this.auth.user()?.id || 'anon'
    };

    let obs$;
    if (this.isEditing() && this.articleId) {
      obs$ = this.articleService.updateArticle(this.articleId, formData);
    } else {
      obs$ = this.articleService.createArticle(formData);
    }

    obs$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/articles']);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set('Failed to save article. ' + (err.message || 'Unknown error'));
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/articles']);
  }
}