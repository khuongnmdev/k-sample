import {CommonModule, isPlatformBrowser} from '@angular/common';
import {ChangeDetectionStrategy, Component, DestroyRef, DoCheck, inject, Input, PLATFORM_ID} from '@angular/core';
import {MarkdownModule} from 'ngx-markdown';
import {HttpClient} from '@angular/common/http';
import {CommonService} from '@services/common.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {LoadingSkeleton} from '@components/loading-skeleton/loading-skeleton';

@Component({
  selector: 'app-code-presenter-old',
  imports: [CommonModule, MarkdownModule, LoadingSkeleton],
  templateUrl: './code-presenter-old.html',
  styleUrl: './code-presenter-old.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class CodePresenterOld implements DoCheck {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly commonService = inject(CommonService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private currentFileName = '';
  protected codeMarkdown = '';
  protected renderCount = 0;

  @Input({required: true})
  set fileName(value: string) {
    if (value && value !== this.currentFileName) {
      this.currentFileName = value;
      this.setupCodeMarkdown();
    }
  }

  @Input() isCheckCD = false;

  ngDoCheck(): void {
    if (this.isCheckCD) {
      this.renderCount++;
    }
  }

  private setupCodeMarkdown() {
    if (!this.currentFileName) {
      return;
    }

    // SSR/Prerender: don't fetch assets via HttpClient
    if (!this.isBrowser) {
      this.codeMarkdown = '';
      return;
    }

    const info = this.getFileInfo(this.currentFileName);
    if (!info.filePath) {
      this.codeMarkdown = '';
      return;
    }

    this.http.get(info.filePath, {responseType: 'text'})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(codeContent => {
        if (!codeContent) {
          this.codeMarkdown = '';
          return;
        }

        const isMarkdown = this.currentFileName.toLowerCase().endsWith('.md');
        this.codeMarkdown = isMarkdown
          ? codeContent
          : `\`\`\`${info.language}\n${codeContent}\n\`\`\``;
      });
  }

  private getFileInfo(fileName: string) {
    const language = this.commonService.getLanguageFromFile(fileName);
    const filePath = language === 'md'
      ? `assets/content/markdown/${fileName}`
      : `assets/content/code-samples/${fileName}`;
    return {filePath, language};
  }
}
