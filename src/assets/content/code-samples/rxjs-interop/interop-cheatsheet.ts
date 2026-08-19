import {Component, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {debounceTime, switchMap} from 'rxjs';

@Component({selector: 'app-interop-cheatsheet', template: '...', standalone: true})
export class InteropCheatsheet {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

  // ===== toSignal: Observable -> Signal =====

  // Cơ bản: chưa có giá trị thì signal trả undefined
  readonly user = toSignal(this.userService.user$);
  // -> Signal<User | undefined>

  // initialValue: có giá trị ngay từ đầu, template không phải xử lý undefined
  readonly products = toSignal(this.http.get<Product[]>('/api/products'), {initialValue: []});
  // -> Signal<Product[]>

  // requireSync: nguồn phát ĐỒNG BỘ ngay khi subscribe
  // (BehaviorSubject, stream có startWith...) - không cần initialValue,
  // nhưng sẽ THROW nếu nguồn không phát ngay lập tức
  readonly theme = toSignal(this.userService.themeSubject$, {requireSync: true});
  // -> Signal<Theme>

  // ===== toObservable: Signal -> Observable =====

  readonly query = signal('');

  // Đưa signal vào pipeline RxJS để dùng operator thời gian / điều phối
  readonly suggestions$ = toObservable(this.query).pipe(
    debounceTime(300),
    switchMap((q) => this.http.get<string[]>(`/api/suggest?q=${q}`)),
  );

  // Ghi chú: cả toSignal lẫn toObservable đều cần INJECTION CONTEXT
  // (khai báo ở field/constructor như trên), hoặc truyền {injector} khi gọi ở nơi khác.

  // Pattern "cây cầu khứ hồi" - chính CodePresenter của app này đang dùng:
  // input signal -> computed(fileInfo) -> toObservable -> switchMap(HTTP) -> toSignal
}
