import { Component, signal } from '@angular/core';
import { CodePresenter } from '@components/code-presenter/code-presenter';
import { CodePresenterObservable } from '@components/code-presenter-observable/code-presenter-observable';
import { CodePresenterOld } from '@components/code-presenter-old/code-presenter-old';

@Component({
  selector: 'app-demo-change-detection',
  imports: [CodePresenter, CodePresenterObservable, CodePresenterOld],
  templateUrl: './demo-change-detection.html',
  styleUrl: './demo-change-detection.scss',
  standalone: true,
})
export class DemoChangeDetection {
  protected readonly currentFile = signal('demo-change-detection/demo.ts');
  protected readonly randomValue = signal(0);
  protected readonly showExplainOnPush = signal(false);
  protected readonly showSummary = signal(false);

  protected triggerRandomChange() {
    this.randomValue.set(Math.random());
  }

  protected triggerExplainOnPush() {
    this.showExplainOnPush.update((v) => !v);
  }

  protected triggerSummary() {
    this.showSummary.update((v) => !v);
  }
}
