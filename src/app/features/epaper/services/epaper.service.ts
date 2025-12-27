
import { Injectable, inject } from '@angular/core';
import { SupabaseService, EPaperPage, EPaperClip } from '../../../core/services/supabase-mock.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { from, map, catchError, throwError, Observable, switchMap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EpaperService {
  private supabase = inject(SupabaseService);
  private imageService = inject(ImageUploadService);

  // --- Pages ---

  getPages(): Observable<EPaperPage[]> {
    return from(this.supabase.from('epaper_pages').select('*')).pipe(
      map(res => {
        if (res.error) throw new Error(res.error.message);
        return (res.data as EPaperPage[]).sort((a, b) => a.page_number - b.page_number);
      }),
      catchError(err => throwError(() => err))
    );
  }

  addPage(file: File, pageNumber: number): Observable<EPaperPage> {
    // Upload to 'epaper-originals' bucket
    return this.imageService.uploadImage(file, 'epaper-originals', 'pages').pipe(
      switchMap(url => {
        const page: Partial<EPaperPage> = {
          page_number: pageNumber,
          image_url: url,
          edition_date: new Date().toISOString()
        };
        return from(this.supabase.from('epaper_pages').insert(page));
      }),
      map(res => {
        if (res.error) throw new Error(res.error.message);
        return res.data[0] as EPaperPage;
      })
    );
  }

  // --- Clips ---

  getClips(pageId: string): Observable<EPaperClip[]> {
    return from(this.supabase.from('epaper_clips').select('*')).pipe(
      map(res => {
        if (res.error) throw new Error(res.error.message);
        return (res.data as EPaperClip[]).filter(c => c.page_id === pageId);
      }),
      catchError(err => throwError(() => err))
    );
  }

  createClip(clip: Partial<EPaperClip>): Observable<EPaperClip> {
    // If image_url is base64, upload to 'epaper-crops' bucket first
    let uploadObs: Observable<string>;

    if (clip.image_url && clip.image_url.startsWith('data:')) {
       uploadObs = this.imageService.uploadBase64(clip.image_url, 'epaper-crops', 'clips');
    } else {
       // Assuming it's already a URL or empty
       uploadObs = of(clip.image_url || '');
    }

    return uploadObs.pipe(
      switchMap(url => {
        const clipToSave = { ...clip, image_url: url };
        return from(this.supabase.from('epaper_clips').insert(clipToSave));
      }),
      map(res => {
        if (res.error) throw new Error(res.error.message);
        return res.data[0] as EPaperClip;
      }),
      catchError(err => throwError(() => err))
    );
  }
  
  deleteClip(id: string): Observable<void> {
    return from(this.supabase.from('epaper_clips').delete().eq('id', id)).pipe(
      map(res => {
        if (res.error) throw new Error(res.error.message);
      }),
      catchError(err => throwError(() => err))
    );
  }
}
