import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, interval, switchMap } from 'rxjs';

const INTERVAL_TIME = 1000;

@Component({
  selector: 'app-demo-polling',
  template: `<p>Open console to see the log</p>`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoPolling {
  private readonly destroyRef = inject(DestroyRef);

  public readonly isLoggedIn = signal<boolean>(false);
  private readonly _shouldPolling$ = toObservable(this.isLoggedIn);

  private readonly _counter = signal<number>(0);
  public readonly counter = this._counter.asReadonly();

  private readonly pollingSubscription = this._shouldPolling$
    .pipe(
      switchMap((shouldPolling) => {
        if (!shouldPolling) return EMPTY;
        return interval(INTERVAL_TIME);
      }),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe(() => {
      this._counter.update((v) => v + 1);
      console.log('Counter hiện tại:', this._counter());
    });

  toggleState() {
    this.isLoggedIn.update((value) => !value);
  }
}
