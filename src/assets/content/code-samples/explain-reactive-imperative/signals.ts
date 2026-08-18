import {Component, computed, signal} from '@angular/core';

@Component({
  selector: 'app-signals-demo',
  template: `
    <button (click)="login()">Login as Admin</button>
    @if (showDeleteButton()) {
      <button class="btn-danger">Delete Product</button>
    }
  `,
  standalone: true,
})
export class SignalsDemoComponent {
  protected isLoggedIn = signal<boolean>(false);
  protected userRole = signal<string>('guest');

  // Logic phái sinh chỉ khai báo MỘT lần duy nhất (Declarative)
  // computed tự ghi nhận phụ thuộc vào isLoggedIn và userRole
  protected showDeleteButton = computed(() => this.isLoggedIn() && this.userRole() === 'admin');

  // CÙNG sự kiện login() - xử lý kiểu Phản ứng (Reactive):
  // chỉ cần cập nhật state nguồn, kết quả tự động tính lại
  protected login() {
    this.isLoggedIn.set(true);
    this.userRole.set('admin');
    // Xong! showDeleteButton tự động cập nhật, không thể quên
  }
}
