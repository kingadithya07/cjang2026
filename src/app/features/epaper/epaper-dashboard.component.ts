
import { Component, inject, signal, ViewChild, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EpaperService } from './services/epaper.service';
import { ArticleService } from '../articles/services/article.service';
import { EPaperPage, EPaperClip, Article } from '../../core/services/supabase-mock.service';
import { ImageCropperComponent } from './image-cropper.component';

@Component({
  selector: 'app-epaper-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageCropperComponent],
  template: `
    <div class="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-gray-100">
      
      <!-- Left Sidebar: Pages -->
      <div class="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col z-10 shadow-sm">
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <h2 class="font-bold text-gray-800">Pages</h2>
          <p class="text-xs text-gray-500">Edition: {{ today | date:'mediumDate' }}</p>
        </div>
        
        <div class="flex-1 overflow-y-auto p-3 space-y-3">
          @for (page of pages(); track page.id) {
            <div (click)="selectPage(page)" 
                 class="group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition border border-transparent"
                 [class.bg-indigo-50]="selectedPage()?.id === page.id"
                 [class.border-indigo-200]="selectedPage()?.id === page.id"
                 [class.hover:bg-gray-50]="selectedPage()?.id !== page.id">
              <div class="h-14 w-10 bg-gray-200 rounded overflow-hidden shadow-sm flex-shrink-0">
                <img [src]="page.image_url" class="h-full w-full object-cover">
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900">Page {{ page.page_number }}</p>
                <div class="flex items-center text-xs text-gray-500">
                  <span class="material-icons text-[10px] mr-1">content_cut</span>
                  {{ getClipCount(page.id) }} clips
                </div>
              </div>
            </div>
          }
          
          <div class="pt-4 mt-2 border-t border-gray-100">
            <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition group">
              @if (uploading()) {
                <span class="material-icons animate-spin text-indigo-500">refresh</span>
                <span class="text-xs font-medium text-indigo-600 mt-1">Uploading...</span>
              } @else {
                <span class="material-icons text-gray-400 group-hover:text-indigo-500 mb-1">upload_file</span>
                <span class="text-xs font-medium text-gray-600 group-hover:text-indigo-600">Add Page</span>
              }
              <input type="file" class="hidden" (change)="uploadPage($event)" accept="image/*" [disabled]="uploading()">
            </label>
          </div>
        </div>
      </div>

      <!-- Center: Workspace -->
      <div class="flex-1 flex flex-col min-w-0 bg-gray-800 relative">
        <!-- Toolbar -->
        <div class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-20">
          <div class="flex items-center gap-4">
            @if (selectedPage()) {
              <h3 class="font-medium text-gray-900">Page {{ selectedPage()!.page_number }}</h3>
              <div class="h-4 w-px bg-gray-300"></div>
              <button (click)="resetCrop()" class="text-sm text-gray-600 hover:text-indigo-600 font-medium px-2 py-1 rounded hover:bg-gray-100 transition">
                Reset Selection
              </button>
            } @else {
              <h3 class="text-gray-500 italic">No page selected</h3>
            }
          </div>
          
          <button 
            (click)="prepareClip()"
            [disabled]="!selectedPage()"
            class="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition">
            <span class="material-icons text-sm">content_cut</span>
            Save Clip
          </button>
        </div>

        <!-- Canvas Area -->
        <div class="flex-1 overflow-hidden p-4 flex items-center justify-center relative">
          @if (selectedPage()) {
            <app-image-cropper 
              [imageUrl]="selectedPage()!.image_url"
              (cropReady)="onCropperReady()">
            </app-image-cropper>
          } @else {
            <div class="text-center text-gray-500">
              <span class="material-icons text-6xl opacity-20">newspaper</span>
              <p class="mt-4">Select a page from the sidebar to begin editing</p>
            </div>
          }
        </div>
      </div>

      <!-- Right Sidebar: Clips & Properties -->
      <div class="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col z-10 shadow-sm">
        
        <!-- Tab Switcher -->
        <div class="flex border-b border-gray-200">
          <button (click)="activeTab = 'clips'" [class.border-indigo-500]="activeTab === 'clips'" [class.text-indigo-600]="activeTab === 'clips'" class="flex-1 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700">Page Clips</button>
          <button (click)="activeTab = 'properties'" [class.border-indigo-500]="activeTab === 'properties'" [class.text-indigo-600]="activeTab === 'properties'" class="flex-1 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700">Properties</button>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          @if (activeTab === 'clips') {
            @if (selectedPageClips().length > 0) {
              <div class="space-y-4">
                @for (clip of selectedPageClips(); track clip.id) {
                  <div class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition group">
                    <div class="h-24 bg-gray-100 rounded mb-3 overflow-hidden border border-gray-100 relative">
                      <img [src]="clip.image_url" class="w-full h-full object-contain">
                      <div class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                         <button (click)="deleteClip(clip.id)" class="p-1 bg-white rounded shadow text-red-500 hover:bg-red-50">
                           <span class="material-icons text-xs font-bold">close</span>
                         </button>
                      </div>
                    </div>
                    <h4 class="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{{ clip.headline }}</h4>
                    <div class="flex flex-col gap-1 mt-2">
                       <span class="text-xs text-gray-500 flex items-center">
                         <span class="material-icons text-[12px] mr-1">{{ clip.article_id ? 'link' : 'image' }}</span>
                         {{ clip.article_id ? 'Linked to Article' : 'Visual Clip Only' }}
                       </span>
                    </div>
                  </div>
                }
              </div>
            } @else {
               <div class="text-center py-8 text-gray-400">
                 <p class="text-sm">No clips created for this page yet.</p>
               </div>
            }
          }

          @if (activeTab === 'properties') {
            @if (selectedPage()) {
              <div class="space-y-4">
                <div class="bg-blue-50 p-3 rounded-md text-blue-800 text-xs mb-4">
                  Select an area on the image and click "Save Clip" to enable these fields.
                </div>
                <div class="text-sm text-gray-600 space-y-2">
                    <p><span class="font-bold">Page Number:</span> {{ selectedPage()!.page_number }}</p>
                    <p><span class="font-bold">Edition Date:</span> {{ selectedPage()!.edition_date | date }}</p>
                    <p><span class="font-bold">ID:</span> <span class="font-mono text-xs">{{ selectedPage()!.id }}</span></p>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>

    <!-- Clip Creation Modal -->
    @if (showClipModal) {
      <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" aria-hidden="true"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-xl leading-6 font-bold text-gray-900 mb-4" id="modal-title">Create Clip</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Preview Column -->
                <div class="space-y-2">
                    <label class="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Preview</label>
                    <div class="bg-gray-100 rounded border border-gray-200 overflow-hidden flex justify-center items-center h-[280px]">
                        <img [src]="tempClipImage" class="max-h-full max-w-full object-contain shadow-sm">
                    </div>
                </div>

                <!-- Form Column -->
                <form [formGroup]="clipForm" class="space-y-5">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Headline</label>
                      <input formControlName="headline" type="text" placeholder="Enter a catchy headline" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition">
                    </div>
                    
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Link to Article</label>
                      <select formControlName="article_id" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white">
                        <option [ngValue]="null">-- No Link (Image Only) --</option>
                        @for (article of articles(); track article.id) {
                          <option [value]="article.id">{{ article.title }}</option>
                        }
                      </select>
                      <p class="text-xs text-gray-500 mt-1">If linked, user can click to read full text.</p>
                    </div>

                    <!-- Watermark Toggle -->
                    <div class="flex items-center justify-between bg-gray-50 p-3 rounded-md border border-gray-200">
                        <div class="flex items-center">
                            <div class="flex items-center h-5">
                                <input id="watermark" formControlName="watermark" type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded cursor-pointer">
                            </div>
                            <div class="ml-3 text-sm">
                                <label for="watermark" class="font-medium text-gray-700 cursor-pointer">Branded Watermark</label>
                                <p class="text-xs text-gray-500">Adds site name & date to bottom strip</p>
                            </div>
                        </div>
                        <span class="material-icons text-gray-400">branding_watermark</span>
                    </div>

                    <!-- User Action Preference -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Default User Action</label>
                        <div class="grid grid-cols-2 gap-3">
                            <label class="cursor-pointer border rounded-md p-3 flex flex-col items-center hover:bg-gray-50 transition"
                                   [class.border-indigo-500]="clipForm.get('action_preference')?.value === 'read'"
                                   [class.bg-indigo-50]="clipForm.get('action_preference')?.value === 'read'">
                                <input type="radio" formControlName="action_preference" value="read" class="sr-only">
                                <span class="material-icons text-indigo-600 mb-1">article</span>
                                <span class="text-xs font-bold text-gray-700">Read Article</span>
                            </label>
                            <label class="cursor-pointer border rounded-md p-3 flex flex-col items-center hover:bg-gray-50 transition"
                                   [class.border-indigo-500]="clipForm.get('action_preference')?.value === 'view'"
                                   [class.bg-indigo-50]="clipForm.get('action_preference')?.value === 'view'">
                                <input type="radio" formControlName="action_preference" value="view" class="sr-only">
                                <span class="material-icons text-pink-600 mb-1">image</span>
                                <span class="text-xs font-bold text-gray-700">View Crop</span>
                            </label>
                        </div>
                    </div>
                </form>
              </div>

            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-100">
              <button (click)="saveClip()" [disabled]="clipForm.invalid" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition">
                Create Clip
              </button>
              <button (click)="cancelClip()" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class EPaperDashboardComponent implements OnInit {
  epaperService = inject(EpaperService);
  articleService = inject(ArticleService);
  fb = inject(FormBuilder);

  @ViewChild(ImageCropperComponent) cropper!: ImageCropperComponent;

  today = new Date();
  activeTab = 'clips';
  showClipModal = false;
  
  // Image handling for preview/watermarking
  tempClipImage: string | null = null;
  rawClipImage: string | null = null; // Clean base64 without watermark
  
  uploading = signal(false);
  
  pages = signal<EPaperPage[]>([]);
  clips = signal<EPaperClip[]>([]);
  articles = signal<Article[]>([]);
  
  selectedPage = signal<EPaperPage | null>(null);
  
  selectedPageClips = computed(() => {
    const p = this.selectedPage();
    if (!p) return [];
    return this.clips().filter(c => c.page_id === p.id);
  });

  clipForm = this.fb.group({
    headline: ['', Validators.required],
    article_id: [null as string | null],
    watermark: [true], // Default to ON
    action_preference: ['read'] // 'read' or 'view'
  });

  constructor() {}

  ngOnInit() {
    this.loadInitialData();

    // Listen for watermark toggle to update preview
    this.clipForm.get('watermark')?.valueChanges.subscribe(enabled => {
        if (this.rawClipImage) {
            this.generatePreviewImage(this.rawClipImage, !!enabled);
        }
    });
  }

  loadInitialData() {
    // Load pages
    this.epaperService.getPages().subscribe(data => {
      this.pages.set(data);
      // If we have pages but none selected, select the first
      if (data.length > 0 && !this.selectedPage()) {
        this.selectPage(data[0]);
      }
    });

    // Load articles for dropdown
    this.articleService.getArticles().subscribe(data => {
      this.articles.set(data);
    });
  }

  selectPage(page: EPaperPage) {
    this.selectedPage.set(page);
    this.activeTab = 'clips';
    this.loadClips(page.id);
  }

  loadClips(pageId: string) {
    this.epaperService.getClips(pageId).subscribe(data => {
      // Merge new clips into state
      const otherClips = this.clips().filter(c => c.page_id !== pageId);
      this.clips.set([...otherClips, ...data]);
    });
  }

  getClipCount(pageId: string) {
    return this.clips().filter(c => c.page_id === pageId).length;
  }

  uploadPage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploading.set(true);
      const nextPageNum = this.pages().length + 1;
      
      this.epaperService.addPage(file, nextPageNum).subscribe({
        next: (newPage) => {
          this.pages.update(p => [...p, newPage]);
          this.selectPage(newPage);
          this.uploading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.uploading.set(false);
          alert('Failed to upload page');
        }
      });
    }
  }

  onCropperReady() {
    // Debug log removed for production
  }

  prepareClip() {
    if (!this.cropper) return;
    
    // Get Clean Canvas
    const canvas = this.cropper.getCroppedCanvas();
    if (canvas) {
      this.rawClipImage = canvas.toDataURL('image/jpeg', 0.95);
      
      // Initialize form defaults
      this.clipForm.patchValue({
          headline: '',
          article_id: null,
          watermark: true,
          action_preference: 'read'
      });

      // Generate Initial Preview (With Watermark by default)
      this.generatePreviewImage(this.rawClipImage!, true);
      this.showClipModal = true;
    }
  }

  private generatePreviewImage(base64Image: string, addWatermark: boolean) {
      if (!addWatermark) {
          this.tempClipImage = base64Image;
          return;
      }

      const img = new Image();
      img.onload = () => {
          const footerHeight = 60; // Big strip
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height + footerHeight;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
              // 1. Draw Original Image
              ctx.drawImage(img, 0, 0);

              // 2. Draw Bottom Strip (Brand Color)
              ctx.fillStyle = '#b91c1c'; // Tailwind red-700
              ctx.fillRect(0, img.height, canvas.width, footerHeight);

              // 3. Draw Text
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 28px "Playfair Display", serif'; // Big Font
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              
              // Date logic
              const dateStr = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
              const text = `CJ NEWS HUB  •  ${dateStr}`;
              
              ctx.fillText(text.toUpperCase(), canvas.width / 2, img.height + (footerHeight / 2));
          }

          this.tempClipImage = canvas.toDataURL('image/jpeg', 0.95);
      };
      img.src = base64Image;
  }

  resetCrop() {
    this.cropper?.reset();
    this.cropper?.clear();
  }

  saveClip() {
    if (this.clipForm.invalid || !this.selectedPage() || !this.tempClipImage) return;

    const cropData = this.cropper.getData();
    
    // We use the tempClipImage because it holds the watermarked version if selected
    const finalImage = this.tempClipImage;
    
    const newClipData: Partial<EPaperClip> = {
      page_id: this.selectedPage()!.id,
      headline: this.clipForm.value.headline!,
      article_id: this.clipForm.value.article_id || undefined,
      image_url: finalImage,
      coords: cropData
    };

    this.epaperService.createClip(newClipData).subscribe(clip => {
      this.clips.update(c => [...c, clip]);
      this.showClipModal = false;
      this.tempClipImage = null;
      this.rawClipImage = null;
      this.resetCrop();
    });
  }

  cancelClip() {
    this.showClipModal = false;
    this.tempClipImage = null;
    this.rawClipImage = null;
  }

  deleteClip(id: string) {
    if(confirm('Delete this clip?')) {
      this.epaperService.deleteClip(id).subscribe(() => {
        this.clips.update(c => c.filter(item => item.id !== id));
      });
    }
  }
}
