import {Component} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {BehaviorSubject, combineLatest, map} from 'rxjs';

@Component({
  selector: 'app-reactive-demo',
  imports: [AsyncPipe],
  template: `
    <button (click)="login()">Login as Admin</button>
    @if (showDeleteButton$ | async) {
      <button class="btn-danger">Delete Product</button>
    }
  `,
  standalone: true,
})
export class ReactiveDemoComponent {
  // Biểu diễn trạng thái đầu vào dưới dạng luồng dữ liệu (Streams)
  protected isLoggedIn$ = new BehaviorSubject<boolean>(false);
  protected userRole$ = new BehaviorSubject<string>('guest');

  // Logic phái sinh chỉ khai báo MỘT lần duy nhất (Declarative)
  protected showDeleteButton$ = combineLatest([this.isLoggedIn$, this.userRole$]).pipe(
    map(([isLoggedIn, role]) => isLoggedIn && role === 'admin'),
  );

  // CÙNG sự kiện login() - xử lý kiểu Reactive với RxJS:
  // đẩy giá trị mới vào stream, showDeleteButton$ tự phát ra kết quả mới
  protected login() {
    this.isLoggedIn$.next(true);
    this.userRole$.next('admin');
  }
}
