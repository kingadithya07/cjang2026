
import { Injectable, inject } from '@angular/core';
import { SupabaseService, Article } from '../../../core/services/supabase-mock.service';
import { from, map, catchError, throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private supabase = inject(SupabaseService);

  getArticles(status?: 'published' | 'draft'): Observable<Article[]> {
    return from(this.supabase.from('articles').select<Article>('*')).pipe(
      map(response => {
        if (response.error) throw new Error(response.error.message);
        let data = response.data || [];
        
        if (status) {
          data = data.filter(a => a.status === status);
        }
        
        return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }),
      catchError((err: unknown) => throwError(() => err))
    );
  }

  getArticleById(id: string): Observable<Article | undefined> {
    return from(this.supabase.from('articles').select<Article>('*')).pipe(
      map(response => {
        if (response.error) throw new Error(response.error.message);
        return (response.data || []).find(a => a.id === id);
      }),
      catchError((err: unknown) => throwError(() => err))
    );
  }

  createArticle(article: Partial<Article>): Observable<Article> {
    return from(this.supabase.from('articles').insert(article)).pipe(
      map(response => {
        if (response.error) throw new Error(response.error.message);
        return response.data![0] as Article;
      }),
      catchError((err: unknown) => throwError(() => err))
    );
  }

  updateArticle(id: string, article: Partial<Article>): Observable<Article> {
    return from(this.supabase.from('articles').update(article).eq('id', id)).pipe(
      map(response => {
        if (response.error) throw new Error(response.error.message);
        return response.data![0] as Article;
      }),
      catchError((err: unknown) => throwError(() => err))
    );
  }

  deleteArticle(id: string): Observable<void> {
    return from(this.supabase.from('articles').delete().eq('id', id)).pipe(
      map(response => {
        if (response.error) throw new Error(response.error.message);
      }),
      catchError((err: unknown) => throwError(() => err))
    );
  }
}
