import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, interval, map, Observable, of, switchMap } from 'rxjs';
import { JsonPipe } from '@angular/common';

const INTERVAL_TIME = 1000;

@Component({
  selector: 'app-demo-polling-by-list',
  imports: [JsonPipe],
  templateUrl: './demo-polling-by-list.html',
  styleUrl: './demo-polling-by-list.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoPollingByList {
  private readonly destroyRef = inject(DestroyRef);

  public readonly listItem = signal<number[]>([]);

  public readonly result = signal<string[]>([]);

  private readonly pollingSubscription = toObservable(this.listItem)
    .pipe(
      map((list) => !!list.length), // convert number[] to boolean
      switchMap((shouldPolling) => {
        if (!shouldPolling) return of([]);
        // if (!shouldPolling) return EMPTY;

        return interval(INTERVAL_TIME).pipe(
          switchMap(() => this.fetchDataByListItem(this.listItem())), // get the newest value of listItem()
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe({
      next: (data) => {
        this.result.set(data);
        console.log('subscribe Result:', data);
      },
      error: (error) => {
        console.log('subscribe Error:', error);
      },
      complete: () => {
        console.log('subscribe Complete');
      },
    });

  private fetchDataByListItem(listItem: number[]): Observable<string[]> {
    const result = listItem.map((value) => `Result for ${value}`);
    return of(result);
  }

  addItem() {
    const newItem = Math.floor(Math.random() * 100) + 1; // random 1-100
    this.listItem.update((value) => [...value, newItem]);
  }

  removeItem() {
    this.listItem.update((value) => [...value.slice(0, -1)]);
  }
}
