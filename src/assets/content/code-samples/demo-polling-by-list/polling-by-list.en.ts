import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { map, Observable, of, switchMap, timer } from 'rxjs';

const INTERVAL_TIME = 1000;

@Component({
  selector: 'app-demo-polling-by-list',
  template: '<p>Open console to see the log</p>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoPollingByList {
  private readonly destroyRef = inject(DestroyRef);

  public readonly listItem = signal<number[]>([]);
  public readonly result = signal<string[]>([]);

  // Listen for changes to the listItem list (Signal -> Observable)
  private readonly pollingSubscription = toObservable(this.listItem)
    .pipe(
      // Turn the list into a boolean: does it have items or not?
      map((list) => !!list.length),
      switchMap((shouldPolling) => {
        // Empty list: stop polling, emit an empty array so the UI clears old results
        // (if we returned EMPTY: polling still stops, but the UI keeps the old data)
        if (!shouldPolling) return of([]);

        // List has items: poll immediately, then repeat every INTERVAL_TIME
        return timer(0, INTERVAL_TIME).pipe(
          // On each poll tick, call the (mock) API with the LATEST list
          switchMap(() => this.fetchDataByListItem(this.listItem())),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe({
      next: (data) => {
        this.result.set(data);
        console.log('subscribe Result:', data);
      },
    });

  private fetchDataByListItem(listItem: number[]): Observable<string[]> {
    const result = listItem.map((value) => `Result for ${value}`);
    return of(result);
  }

  addItem() {
    const newItem = Math.floor(Math.random() * 100) + 1;
    this.listItem.update((value) => [...value, newItem]);
  }

  removeItem() {
    this.listItem.update((value) => [...value.slice(0, -1)]);
  }
}
