import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {effect, inject, Injectable, PLATFORM_ID, signal} from '@angular/core';

export const DEFAULT_LANGUAGE = 'typescript';
const STORAGE_KEY = 'darkMode';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    if (this.isBrowser) {
      const currentConfigDarkmode = this.readConfigDarkModeFromStorage();
      if (currentConfigDarkmode !== null) {
        this.isDarkMode.set(currentConfigDarkmode);
      }
    }

    effect(() => {
      const isDarkMode = this.isDarkMode();

      // SSR-safe: only touch DOM + storage in browser
      if (!this.isBrowser) return;

      const html = this.document.documentElement;
      html.classList.toggle('dark-theme', isDarkMode);
      this.writeConfigDarkModeToStorage(isDarkMode);
    });
  }

  // Get language from file name: abc.typescript.md => typescript
  getLanguageFromFile(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');

    if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) {
      return DEFAULT_LANGUAGE;
    }

    const baseName = fileName.substring(0, lastDotIndex); // abc.typescript.md => abc.typescript
    const secondLastDotIndex = baseName.lastIndexOf('.');

    if (secondLastDotIndex > 0) {
      return baseName.substring(secondLastDotIndex + 1);
    } else {
      return fileName.substring(lastDotIndex + 1, fileName.length);
    }
  }

  toggleDarkmode(): void {
    this.isDarkMode.update(v => !v);
  }

  setDarkMode(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }

  private readConfigDarkModeFromStorage(): boolean | null {
    if (!this.isBrowser) return null;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return null;
      return raw === 'true';
    } catch {
      return null;
    }
  }

  private writeConfigDarkModeToStorage(isDark: boolean): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(STORAGE_KEY, String(isDark));
    } catch {
      // ignore (blocked storage, private mode, etc.)
    }
  }
}
