import {Component, computed, inject, Injector, Input, Signal, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
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
})
export class CodePresenter {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector); // Use toSignal
  private readonly commonService = inject(CommonService);
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

  public readonly codeMarkdown: Signal<string | undefined> = toSignal(
    this.codeMarkdown$,
    {
      injector: this.injector, // Need injector provide lifecycle context, make sure unsubscribe when component destroyed
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
    const filePath = `assets/content/code-samples/${fileName}`;
    return {filePath, language};
  });
}
