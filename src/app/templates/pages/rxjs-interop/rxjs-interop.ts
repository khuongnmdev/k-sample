import {ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {debounceTime, delay, distinctUntilChanged, of, switchMap} from 'rxjs';
import {CodePresenter} from '@components/code-presenter/code-presenter';

const PRODUCTS = ['Angular', 'RxJS', 'Signals', 'TypeScript', 'Zone.js', 'Node.js', 'NgRx', 'Nx'];

@Component({
  selector: 'app-rxjs-interop',
  imports: [CodePresenter],
  templateUrl: './rxjs-interop.html',
  styleUrl: './rxjs-interop.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RxjsInterop {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected showExplainInterop = signal<boolean>(false);
  protected showPitfalls = signal<boolean>(false);

  // 1. Signal: state gốc, được UI cập nhật qua ô input
  protected readonly searchTerm = signal('');

  // Đếm số lần "API" thật sự được gọi - minh chứng debounce hoạt động
  protected readonly searchCallCount = signal(0);

  // 2. toObservable: Signal -> Observable, để dùng các operator "thời gian"
  //    mà thế giới Signal không có (debounce, distinct, switchMap...)
  //    (SSR: không dựng pipeline để timer của debounce không kéo chậm prerender)
  private readonly results$ = this.isBrowser
    ? toObservable(this.searchTerm).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.fakeSearchApi(term)),
      )
    : of([] as string[]);

  // 3. toSignal: Observable -> Signal, template đọc trực tiếp results()
  protected readonly results = toSignal(this.results$, {initialValue: [] as string[]});

  protected onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  private fakeSearchApi(term: string) {
    // Chuỗi rỗng: không "gọi API"
    if (!term.trim()) {
      return of([] as string[]);
    }
    this.searchCallCount.update((count) => count + 1);
    const found = PRODUCTS.filter((p) => p.toLowerCase().includes(term.trim().toLowerCase()));
    return of(found).pipe(delay(300)); // giả lập độ trễ mạng
  }

  protected triggerExplainInterop() {
    this.showExplainInterop.set(true);
  }

  protected triggerPitfalls() {
    this.showPitfalls.set(true);
  }
}
