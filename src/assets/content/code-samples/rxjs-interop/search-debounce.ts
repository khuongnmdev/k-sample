import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs';

@Component({
  selector: 'app-search-demo',
  template: `
    <input [value]="searchTerm()" (input)="onSearch($event)" />
    @for (item of results(); track item) {
      <li>{{ item }}</li>
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDemoComponent {
  private readonly http = inject(HttpClient);

  // 1. Signal: state gốc - ô input ghi thẳng vào đây
  readonly searchTerm = signal('');

  // 2. toObservable: Signal -> Observable
  //    Vào "thế giới RxJS" để dùng các operator THỜI GIAN mà Signal không có:
  //    - debounceTime: gõ nhanh chỉ lấy nhịp cuối
  //    - distinctUntilChanged: giá trị không đổi thì bỏ qua
  //    - switchMap: request cũ đang bay bị HỦY khi có term mới
  private readonly results$ = toObservable(this.searchTerm).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => this.searchApi(term)),
  );

  // 3. toSignal: Observable -> Signal
  //    Quay về "thế giới Signal" cho template đọc trực tiếp results(),
  //    không cần async pipe, tự unsubscribe khi component destroy
  readonly results = toSignal(this.results$, {initialValue: [] as string[]});

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  private searchApi(term: string) {
    return this.http.get<string[]>(`/api/search?q=${term}`);
  }
}
