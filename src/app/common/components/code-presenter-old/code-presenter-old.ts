import {ChangeDetectionStrategy, Component, DestroyRef, DoCheck, inject, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
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
    const info = this.getFileInfo(this.currentFileName);
    if (!info.filePath) {
      this.codeMarkdown = '';
    }
    this.http.get(info.filePath, {responseType: 'text'})
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(codeContent => {
        if (codeContent) {
          this.codeMarkdown = `\`\`\`${info.language}\n${codeContent}\n\`\`\``;
        }
      })
  }

  private getFileInfo(fileName: string) {
    const language = this.commonService.getLanguageFromFile(fileName);
    const filePath = `assets/content/code-samples/${fileName}`;
    return {filePath, language};
  }
}
