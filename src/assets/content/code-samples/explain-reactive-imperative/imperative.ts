import { Component } from '@angular/core';

@Component({
  selector: 'app-imperative-demo',
  template: `
    <button (click)="login()">Login as Admin</button>
    @if (showDeleteButton) {
      <button class="btn-danger">Delete Product</button>
    }
  `,
  standalone: true
})
export class ImperativeDemoComponent {
  protected isLoggedIn = false;
  protected userRole = 'admin'; // Giả lập login với quyền admin
  protected showDeleteButton = false;

  // Mỗi khi có thay đổi, bắt buộc phải nhớ gọi hàm cập nhật này
  private updateUI() {
    if (this.isLoggedIn && this.userRole === 'admin') {
      this.showDeleteButton = true;
    } else {
      this.showDeleteButton = false;
    }
  }

  protected login() {
    this.isLoggedIn = true;
    this.updateUI(); // Gọi thủ công (Manual call)
  }
}
