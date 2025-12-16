import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DoCheck,
  inject,
  Injector,
  Input,
  PLATFORM_ID,
  Signal,
  signal
} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of, switchMap} from 'rxjs';
import {MarkdownModule} from 'ngx-markdown';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {LoadingSkeleton} from '@components/loading-skeleton/loading-skeleton';
import {CommonService, DEFAULT_LANGUAGE} from '@services/common.service';

@Component({
  selector: 'app-code-presenter',
  imports: [CommonModule, MarkdownModule, LoadingSkeleton],
  standalone: true,
  templateUrl: './code-presenter.html',
  styleUrl: './code-presenter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodePresenter implements DoCheck {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);
  private readonly commonService = inject(CommonService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  public readonly currentFileName = signal<string>('');
  protected renderCount = 0;

  @Input({required: true})
  set fileName(value: string) {
    if (value && value !== this.currentFileName()) {
      this.currentFileName.set(value);
    }
  }

  @Input() isCheckCD = false;

  ngDoCheck(): void {
    if (this.isCheckCD) {
      this.renderCount++;
    }
  }

  // Declare Observable to handle async data fetching file content
  private readonly codeMarkdown$: Observable<string> = toObservable(this.currentFileName)
    .pipe(
      switchMap(() => {
        // SSR/Prerender: don't fetch assets via HttpClient
        if (!this.isBrowser) {
          return of(''); // or: of('Content loads on client...')
        }

        const info = this.fileInfo();

        if (!info.filePath) {
          return of('');
        }

        return this.http.get(info.filePath, {responseType: 'text'})
          .pipe(
            map(codeContent => {
              const isMarkdown = this.currentFileName().toLowerCase().endsWith('.md');
              return isMarkdown
                ? codeContent
                : `\`\`\`${info.language}\n${codeContent}\n\`\`\``;
            })
          );
      })
    );

  public readonly codeMarkdown: Signal<string | undefined> = toSignal(
    this.codeMarkdown$,
    {
      injector: this.injector,
      initialValue: 'Loading code...'
    }
  );

  // Use computed to set up language and filePath data when the currentFileName signal changes (emit new data)
  private readonly fileInfo = computed(() => {
    const fileName = this.currentFileName();
    if (!fileName) {
      return {filePath: '', language: DEFAULT_LANGUAGE};
    }
    const language = this.commonService.getLanguageFromFile(fileName);
    const filePath = language === 'md'
      ? `assets/content/markdown/${fileName}`
      : `assets/content/code-samples/${fileName}`;
    return {filePath, language};
  });
}
