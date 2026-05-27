import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-signals-demo',
  template: `
    <button (click)="login()">Login as Admin</button>
    @if (showDeleteButton()) {
      <button class="btn-danger">Delete Product</button>
    }
  `,
  standalone: true
})
export class SignalsDemoComponent {
  // Khai báo các trạng thái đầu vào dưới dạng signals
  protected isLoggedIn = signal<boolean>(false);
  protected userRole = signal<string>('admin'); // Giả lập login với quyền admin

  // Định nghĩa mối quan hệ một lần duy nhất (Declarative)
  // Dòng chảy trạng thái tự động bắt đầu từ đây
  protected showDeleteButton = computed(() => 
    this.isLoggedIn() && this.userRole() === 'admin'
  );

  protected login() {
    this.isLoggedIn.set(true);
    // Xong! showDeleteButton tự động cập nhật giá trị mới nhất
  }
}
