import {Component, computed, inject, Injector, Input, Signal, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of, switchMap} from 'rxjs';
import {MarkdownModule} from 'ngx-markdown';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {LoadingSkeleton} from '@components/loading-skeleton/loading-skeleton';

export const DEFAULT_LANGUAGE = 'typescript';

@Component({
  selector: 'app-code-presenter',
  imports: [CommonModule, MarkdownModule, LoadingSkeleton],
  standalone: true,
  templateUrl: './code-presenter.html',
  styleUrl: './code-presenter.scss',
})
export class CodePresenter {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector); // Use toSignal
  public readonly currentFileName = signal<string>('');

  @Input({required: true})
  set fileName(value: string) {
    if (value && value !== this.currentFileName()) {
      this.currentFileName.set(value);
    }
  }

  // Declare Observable to handle async data fetching file content
  private readonly codeMarkdown$: Observable<string> = toObservable(this.currentFileName)
    .pipe(
      switchMap(() => {  // Use switchMap to ensure that the previous file content is cleared before fetching the new one
        const info = this.fileInfo();

        if (!info.filePath) {
          return of('');
        }

        return this.http.get(info.filePath, {responseType: 'text'})
          .pipe(
            map(codeContent => {
              return `\`\`\`${info.language}\n${codeContent}\n\`\`\``;
            })
          );
      })
    );

  // Use computed to set up language and filePath data when the currentFileName signal changes (emit new data)
  private readonly fileInfo = computed(() => {
    const fileName = this.currentFileName();
    if (!fileName) {
      return {filePath: '', language: DEFAULT_LANGUAGE};
    }
    const language = this.getLanguageFromFile(fileName);
    const filePath = `assets/content/code-samples/${fileName}`;
    return {filePath, language};
  });

  public readonly codeMarkdown: Signal<string | undefined> = toSignal(
    this.codeMarkdown$,
    {
      injector: this.injector,
      initialValue: 'Loading code...'
    }
  );

  // Get language from file name: abc.typescript.md => typescript
  private getLanguageFromFile(fileName: string): string {
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
