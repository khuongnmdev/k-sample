import { Component, DestroyRef, inject, NgZone, signal } from '@angular/core';
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
  private readonly destroyRef = inject(DestroyRef);

  protected readonly currentFile = signal('demo-change-detection/demo.ts');
  protected readonly randomValue = signal(0);
  protected readonly showExplainOnPush = signal(false);
  protected readonly showSummary = signal(false);

  // Auto-detect the current CD mode (switch the provider in app.config.ts)
  protected readonly cdMode = NgZone.isInAngularZone() ? 'Zone.js (NgZone)' : 'Zoneless';

  // NgZone experiment: a PLAIN variable (not a signal), increased by window.setInterval
  protected plainTickCount = 0;
  protected readonly intervalRunning = signal(false);
  private intervalId?: number;

  constructor() {
    this.destroyRef.onDestroy(() => window.clearInterval(this.intervalId));
  }

  protected triggerRandomChange() {
    this.randomValue.set(Math.random());
  }

  protected toggleZoneInterval() {
    if (this.intervalRunning()) {
      window.clearInterval(this.intervalId);
      this.intervalRunning.set(false);
      return;
    }

    this.intervalRunning.set(true);
    this.intervalId = window.setInterval(() => {
      // Zone.js: after each callback, NgZone runs CD automatically -> UI updates by itself
      // Zoneless: nobody notifies Angular -> UI stays frozen while the variable keeps increasing
      this.plainTickCount++;
      console.log('window.setInterval tick:', this.plainTickCount);
    }, 1000);
  }

  protected triggerExplainOnPush() {
    this.showExplainOnPush.update((v) => !v);
  }

  protected triggerSummary() {
    this.showSummary.update((v) => !v);
  }
}
