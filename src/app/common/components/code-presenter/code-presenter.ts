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
import {EMPTY, map, Observable, of, switchMap} from 'rxjs';
import {MarkdownModule} from 'ngx-markdown';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {LoadingSkeleton} from '@components/loading-skeleton/loading-skeleton';
import {CommonService, DEFAULT_LANGUAGE} from '@services/common.service';

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

  // Use computed to set up language and filePath data when the fileName signal changes (emit new data)
  private readonly fileInfo = computed(() => {
    const fileName = this.fileName();
    if (!fileName) {
      return {filePath: '', language: DEFAULT_LANGUAGE};
    }
    const language = this.commonService.getLanguageFromFile(fileName);
    const filePath =
      language === 'md'
        ? `assets/content/markdown/${fileName}`
        : `assets/content/code-samples/${fileName}`;
    return {filePath, language};
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
        map((codeContent) => {
          const isMarkdown = info.language === 'md';
          return isMarkdown ? codeContent : `\`\`\`${info.language}\n${codeContent}\n\`\`\``;
        }),
      );
    }),
  );

  public readonly codeMarkdown: Signal<string | undefined> = toSignal(this.codeMarkdown$, {
    injector: this.injector,
    initialValue: 'Loading code...',
  });
}
