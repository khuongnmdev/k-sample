import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, interval, map, Observable, of, switchMap } from 'rxjs';

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

  // Lắng nghe sự thay đổi của danh sách listItem (Signal -> Observable)
  private readonly pollingSubscription = toObservable(this.listItem)
    .pipe(
      // Chuyển đổi danh sách thành boolean: Có phần tử hay không?
      map((list) => !!list.length),
      switchMap((shouldPolling) => {
        // Nếu danh sách trống, ngừng bộ đếm và xóa sạch kết quả cũ
        if (!shouldPolling) return of([]);

        // Nếu có danh sách, bắt đầu bộ đếm thời gian
        return interval(INTERVAL_TIME).pipe(
          // Mỗi nhịp đếm, thực hiện gọi API (giả lập) với danh sách hiện tại
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
    const result = listItem.map((value) => `Result for ID: ${value}`);
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
