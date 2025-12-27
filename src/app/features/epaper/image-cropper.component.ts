
import { Component, ElementRef, ViewChild, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Declare Cropper global from CDN
declare const Cropper: any;

@Component({
  selector: 'app-image-cropper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-[600px] w-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
      <img #imageElement [src]="imageUrl" class="max-w-full max-h-full block opacity-0" alt="Source" (load)="onImageLoad()">
    </div>
  `
})
export class ImageCropperComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() imageUrl = '';
  @Input() aspectRatio = NaN; // NaN = Free crop
  @Output() cropReady = new EventEmitter<void>();

  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;
  
  private cropper: any;

  ngAfterViewInit() {
    // Initial setup if image is already present
    if (this.imageUrl) {
       // Wait for load event
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['imageUrl'] && !changes['imageUrl'].firstChange) {
      this.destroyCropper();
      // Image src binding updates automatically, onImageLoad will trigger
    }
  }

  onImageLoad() {
    this.initCropper();
  }

  initCropper() {
    if (this.cropper) return;
    
    const image = this.imageElement.nativeElement;
    this.cropper = new Cropper(image, {
      aspectRatio: this.aspectRatio,
      viewMode: 1, // Restrict crop box to canvas
      dragMode: 'crop',
      autoCropArea: 0.5,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      ready: () => {
        this.cropReady.emit();
      }
    });
  }

  destroyCropper() {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  ngOnDestroy() {
    this.destroyCropper();
  }

  // Public API for Parent
  getData() {
    return this.cropper ? this.cropper.getData() : null;
  }

  getCroppedCanvas() {
    return this.cropper ? this.cropper.getCroppedCanvas() : null;
  }
  
  reset() {
    if (this.cropper) this.cropper.reset();
  }

  clear() {
    if (this.cropper) this.cropper.clear();
  }
}
