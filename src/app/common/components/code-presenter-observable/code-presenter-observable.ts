import {ChangeDetectionStrategy, Component, DestroyRef, DoCheck, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, map, Observable, of, switchMap} from 'rxjs';
import {MarkdownModule} from 'ngx-markdown';
import {LoadingSkeleton} from '@components/loading-skeleton/loading-skeleton';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
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
  private readonly currentFileName$ = new BehaviorSubject<string>('');

  protected renderCount = 0;

  @Input() isCheckCD = false;

  @Input({required: true})
  set fileName(value: string) {
    if (value && value !== this.currentFileName$.value) {
      this.currentFileName$.next(value);
    }
  }

  public readonly codeMarkdown$: Observable<string>;

  ngDoCheck(): void {
    if (this.isCheckCD) {
      this.renderCount++;
    }
  }

  constructor() {
    this.codeMarkdown$ = this.currentFileName$
      .pipe(
        switchMap((fileName: string) => {
          if (!fileName) {
            return of('Loading code...');
          }

          const info = this.getFileInfo(fileName);

          if (!info.filePath) {
            return of('');
          }

          return this.http.get(info.filePath, {responseType: 'text'})
            .pipe(
              map(codeContent => {
                return `\`\`\`${info.language}\n${codeContent}\n\`\`\``;
              })
            );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
  }

  private getFileInfo(fileName: string) {
    const language = this.commonService.getLanguageFromFile(fileName);
    const filePath = `assets/content/code-samples/${fileName}`;
    return {filePath, language};
  }
}
