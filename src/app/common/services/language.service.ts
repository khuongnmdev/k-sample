import {isPlatformBrowser} from '@angular/common';
import {effect, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';

// Content language for teaching material (markdown articles + code samples).
// 'vi' = original files, 'en' = files with the '.en' suffix (explain-x.en.md, sample.en.ts)
export type ContentLanguage = 'vi' | 'en';

const STORAGE_KEY = 'contentLanguage';

@Injectable({providedIn: 'root'})
export class LanguageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly language = signal<ContentLanguage>('vi');

  constructor() {
    if (this.isBrowser) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'vi') {
          this.language.set(saved);
        }
      } catch {
        // storage unavailable - keep default
      }
    }

    effect(() => {
      // SSR-safe: only touch storage in the browser
      if (!this.isBrowser) return;
      try {
        localStorage.setItem(STORAGE_KEY, this.language());
      } catch (e) {
        console.error(e);
      }
    });
  }

  toggleLanguage(): void {
    this.language.update((l) => (l === 'vi' ? 'en' : 'vi'));
  }

  // explain-x.md -> explain-x.en.md | demo-polling/polling.ts -> demo-polling/polling.en.ts
  // Returns the fileName unchanged for 'vi' (original files carry no suffix)
  localizeFileName(fileName: string): string {
    if (this.language() === 'vi') return fileName;

    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex <= 0) return fileName;

    return `${fileName.substring(0, lastDotIndex)}.en${fileName.substring(lastDotIndex)}`;
  }
}
