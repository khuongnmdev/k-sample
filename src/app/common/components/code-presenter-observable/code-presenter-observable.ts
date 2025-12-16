import {ChangeDetectionStrategy, Component, DestroyRef, DoCheck, inject, Input, PLATFORM_ID} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, EMPTY, map, Observable, of, switchMap} from 'rxjs';
import {MarkdownModule} from 'ngx-markdown';
import {LoadingSkeleton} from '@components/loading-skeleton/loading-skeleton';
import {CommonService} from '@services/common.service';

@Component({
  selector: 'app-code-presenter-observable',
  imports: [CommonModule, MarkdownModule, LoadingSkeleton],
  standalone: true,
  templateUrl: './code-presenter-observable.html',
  styleUrl: './code-presenter-observable.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodePresenterObservable implements DoCheck {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly commonService = inject(CommonService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly currentFileName$ = new BehaviorSubject<string>('');

  protected renderCount = 0;

  @Input() showRenderCount = false;

  @Input({required: true})
  set fileName(value: string) {
    if (value && value !== this.currentFileName$.value) {
      this.currentFileName$.next(value);
    }
  }

  public readonly codeMarkdown$: Observable<string>;

  ngDoCheck(): void {
    if (this.showRenderCount) {
      this.renderCount++;
    }
  }

  constructor() {
    this.codeMarkdown$ = this.currentFileName$
      .pipe(
        switchMap((fileName: string) => {
          // SSR/Prerender: don't fetch assets via HttpClient
          if (!this.isBrowser) {
            return EMPTY;
          }

          const info = this.getFileInfo(fileName);
          if (!fileName || !info.filePath) {
            return of('');
          }

          return this.http.get(info.filePath, {responseType: 'text'})
            .pipe(
              map(codeContent => {
                const isMarkdown = fileName.toLowerCase().endsWith('.md');
                return isMarkdown
                  ? codeContent
                  : `\`\`\`${info.language}\n${codeContent}\n\`\`\``;
              })
            );
        }),
      )
  }

  private getFileInfo(fileName: string) {
    const language = this.commonService.getLanguageFromFile(fileName);
    const filePath = language === 'md'
      ? `assets/content/markdown/${fileName}`
      : `assets/content/code-samples/${fileName}`;
    return {filePath, language};
  }
}
