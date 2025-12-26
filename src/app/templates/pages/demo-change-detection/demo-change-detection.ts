import {Component, signal} from '@angular/core';
import {CodePresenter} from '@components/code-presenter/code-presenter';
import {CodePresenterObservable} from '@components/code-presenter-observable/code-presenter-observable';
import {CodePresenterOld} from '@components/code-presenter-old/code-presenter-old';

@Component({
  selector: 'app-demo-change-detection',
  imports: [
    CodePresenter,
    CodePresenterObservable,
    CodePresenterOld
  ],
  templateUrl: './demo-change-detection.html',
  styleUrl: './demo-change-detection.scss',
})
export class DemoChangeDetection {
  currentFile = signal('demo.ts');
  randomValue = signal(0);
  showExplainOnPush = signal(false);
  showSummary = signal(false);

  protected triggerRandomChange() {
    this.randomValue.set(Math.random());
  }

  protected triggerExplainOnPush() {
    this.showExplainOnPush.set(true);
  }

  protected triggerSummary() {
    this.showSummary.set(true);
  }
}
