import {Component} from '@angular/core';

@Component({
  selector: 'app-imperative-demo',
  template: `
    <button (click)="login()">Login as Admin</button>
    @if (showDeleteButton) {
      <button class="btn-danger">Delete Product</button>
    }
  `,
  standalone: true,
})
export class ImperativeDemoComponent {
  protected isLoggedIn = false;
  protected userRole = 'guest';
  protected showDeleteButton = false;

  // CÙNG sự kiện login() - xử lý kiểu Mệnh lệnh (Imperative):
  // tự tay cập nhật từng biến, rồi PHẢI NHỚ gọi hàm tính lại kết quả
  protected login() {
    this.isLoggedIn = true;
    this.userRole = 'admin';
    this.updateDeleteButton(); // Quên dòng này là UI sai ngay!
  }

  // Logic phái sinh phải được gọi thủ công tại MỌI nơi làm thay đổi state
  private updateDeleteButton() {
    this.showDeleteButton = this.isLoggedIn && this.userRole === 'admin';
  }
}
