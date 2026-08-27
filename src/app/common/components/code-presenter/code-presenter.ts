import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DoCheck,
  inject,
  Injector,
  input,
  PLATFORM_ID,
  Signal,
} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {catchError, EMPTY, map, Observable, of, switchMap} from 'rxjs';
import {MarkdownModule} from 'ngx-markdown';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {LoadingSkeleton} from '@components/loading-skeleton/loading-skeleton';
import {CommonService, DEFAULT_LANGUAGE} from '@services/common.service';
import {LanguageService} from '@services/language.service';

@Component({
  selector: 'app-code-presenter-signal',
  imports: [CommonModule, MarkdownModule, LoadingSkeleton],
  standalone: true,
  templateUrl: './code-presenter.html',
  styleUrl: './code-presenter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodePresenter implements DoCheck {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);
  private readonly commonService = inject(CommonService);
  private readonly languageService = inject(LanguageService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  protected renderCount = 0;

  readonly fileName = input.required<string>();
  readonly showRenderCount = input(false);

  ngDoCheck(): void {
    if (this.showRenderCount()) {
      this.renderCount++;
    }
  }

  // Recomputes when the fileName input OR the content language changes.
  // Prism language is derived from the ORIGINAL fileName (the '.en' suffix must not affect it).
  private readonly fileInfo = computed(() => {
    const fileName = this.fileName();
    if (!fileName) {
      return {filePath: '', fallbackPath: '', language: DEFAULT_LANGUAGE};
    }
    const language = this.commonService.getLanguageFromFile(fileName);
    const baseDir = language === 'md' ? 'assets/content/markdown/' : 'assets/content/code-samples/';
    const localizedName = this.languageService.localizeFileName(fileName);
    return {
      filePath: baseDir + localizedName,
      // Translation missing -> fall back to the original (Vietnamese) file
      fallbackPath: localizedName === fileName ? '' : baseDir + fileName,
      language,
    };
  });

  // Declare Observable to handle async data fetching file content
  private readonly codeMarkdown$: Observable<string> = toObservable(this.fileInfo).pipe(
    switchMap((info) => {
      // SSR/Prerender: don't fetch assets via HttpClient
      if (!this.isBrowser) {
        return EMPTY;
      }

      if (!info.filePath) {
        return of('');
      }

      return this.http.get(info.filePath, {responseType: 'text'}).pipe(
        // Dev/SSR servers answer missing assets with the SPA index.html (status 200) -
        // detect that "soft 404" and treat it as a missing translation
        switchMap((content) =>
          info.fallbackPath && this.isSpaFallback(content)
            ? this.http.get(info.fallbackPath, {responseType: 'text'})
            : of(content),
        ),
        // Real 404 -> serve the original file instead
        catchError(() =>
          info.fallbackPath ? this.http.get(info.fallbackPath, {responseType: 'text'}) : of(''),
        ),
        map((codeContent) => {
          const isMarkdown = info.language === 'md';
          return isMarkdown ? codeContent : `\`\`\`${info.language}\n${codeContent}\n\`\`\``;
        }),
      );
    }),
  );

  private isSpaFallback(content: string): boolean {
    return /^\s*<!doctype html/i.test(content);
  }

  // Empty initial value so the template's @else branch shows the loading skeleton
  // (a truthy placeholder would render as raw text and the skeleton would never appear)
  public readonly codeMarkdown: Signal<string | undefined> = toSignal(this.codeMarkdown$, {
    injector: this.injector,
    initialValue: '',
  });
}
