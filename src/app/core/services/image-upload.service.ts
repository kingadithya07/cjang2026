
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase-mock.service';
import { from, map, catchError, throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private supabase = inject(SupabaseService);

  uploadImage(file: File | Blob, bucket: string = 'images', folder: string = 'uploads'): Observable<string> {
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    let extension = '';
    if (file instanceof File) {
      const parts = file.name.split('.');
      if (parts.length > 1) extension = `.${parts.pop()}`;
    } else {
        extension = '.jpg'; 
    }
    
    const path = folder ? `${folder}/${fileName}${extension}` : `${fileName}${extension}`;

    return from(this.supabase.storage.from(bucket).upload(path, file)).pipe(
      map(response => {
        if (response.error) throw new Error(response.error.message);
        const { data } = this.supabase.storage.from(bucket).getPublicUrl(response.data!.path);
        return data.publicUrl;
      }),
      catchError((err: unknown) => throwError(() => {
        const msg = err instanceof Error ? err.message : String(err);
        return new Error('Image upload failed: ' + msg);
      }))
    );
  }

  uploadBase64(base64: string, bucket: string, folder: string = 'uploads'): Observable<string> {
    try {
      const blob = this.base64ToBlob(base64);
      return this.uploadImage(blob, bucket, folder);
    } catch (e) {
      return throwError(() => new Error('Invalid base64 string'));
    }
  }

  private base64ToBlob(base64: string): Blob {
    const arr = base64.split(',');
    const match = arr[0].match(/:(.*?);/);
    if (!match) throw new Error('Invalid base64 format');
    
    const mime = match[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
}
