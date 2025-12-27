
import { Component, ElementRef, forwardRef, ViewChild, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="border border-gray-300 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
      <!-- Toolbar -->
      <div class="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 overflow-x-auto">
        <button type="button" (click)="exec('bold')" class="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Bold">
          <span class="material-icons text-sm font-bold">format_bold</span>
        </button>
        <button type="button" (click)="exec('italic')" class="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Italic">
          <span class="material-icons text-sm">format_italic</span>
        </button>
        <button type="button" (click)="exec('underline')" class="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Underline">
          <span class="material-icons text-sm">format_underlined</span>
        </button>
        <div class="w-px h-4 bg-gray-300 mx-1"></div>
        <button type="button" (click)="exec('formatBlock', 'H2')" class="p-1.5 rounded hover:bg-gray-200 text-gray-600 font-bold text-xs" title="Heading">H2</button>
        <button type="button" (click)="exec('formatBlock', 'H3')" class="p-1.5 rounded hover:bg-gray-200 text-gray-600 font-bold text-xs" title="Subheading">H3</button>
        <div class="w-px h-4 bg-gray-300 mx-1"></div>
        <button type="button" (click)="exec('insertUnorderedList')" class="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Bullet List">
          <span class="material-icons text-sm">format_list_bulleted</span>
        </button>
        <button type="button" (click)="exec('insertOrderedList')" class="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Numbered List">
          <span class="material-icons text-sm">format_list_numbered</span>
        </button>
        <button type="button" (click)="exec('createLink', promptLink())" class="p-1.5 rounded hover:bg-gray-200 text-gray-600" title="Link">
          <span class="material-icons text-sm">link</span>
        </button>
      </div>

      <!-- Editor Area -->
      <div #editor
           class="p-4 min-h-[300px] outline-none prose max-w-none text-sm"
           contenteditable="true"
           (input)="onInput()"
           (blur)="onTouched()">
      </div>
    </div>
  `
})
export class RichTextEditorComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('editor') editor!: ElementRef<HTMLDivElement>;

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  ngAfterViewInit() {
    // Ensure styles are available
  }

  exec(command: string, value: string | null = null) {
    if (value === null && command === 'createLink') return; // Cancelled by user
    
    // safe cast or default because execCommand treats non-strings unpredictably
    document.execCommand(command, false, value || '');
    
    this.editor.nativeElement.focus();
    this.onInput();
  }

  promptLink(): string | null {
    return prompt('Enter URL:');
  }

  onInput() {
    const html = this.editor.nativeElement.innerHTML;
    this.onChange(html);
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    if (this.editor) {
      this.editor.nativeElement.innerHTML = value || '';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
