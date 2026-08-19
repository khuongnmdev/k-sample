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

  // Lắng nghe sự thay đổi của danh sách listItem (Signal -> Observable)
  private readonly pollingSubscription = toObservable(this.listItem)
    .pipe(
      // Chuyển danh sách thành boolean: có phần tử hay không?
      map((list) => !!list.length),
      switchMap((shouldPolling) => {
        // Danh sách trống: dừng polling, phát mảng rỗng để UI xóa kết quả cũ
        // (nếu trả về EMPTY: polling vẫn dừng, nhưng UI giữ nguyên dữ liệu cũ)
        if (!shouldPolling) return of([]);

        // Danh sách có phần tử: poll ngay lập tức, sau đó lặp lại mỗi INTERVAL_TIME
        return timer(0, INTERVAL_TIME).pipe(
          // Mỗi nhịp poll, gọi API (giả lập) với danh sách MỚI NHẤT
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
