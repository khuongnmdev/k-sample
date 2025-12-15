import { Injectable } from '@angular/core';
export const DEFAULT_LANGUAGE = 'typescript';

@Injectable({
  providedIn: 'root',
})
export class CommonService {

  // Get language from file name: abc.typescript.md => typescript
  public getLanguageFromFile(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');

    if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) {
      return DEFAULT_LANGUAGE;
    }

    const baseName = fileName.substring(0, lastDotIndex); // abc.typescript.md => abc.typescript
    const secondLastDotIndex = baseName.lastIndexOf('.');

    if (secondLastDotIndex > 0) {
      return baseName.substring(secondLastDotIndex + 1);
    } else {
      return DEFAULT_LANGUAGE;
    }
  }
}
