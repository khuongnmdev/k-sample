import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {httpResource} from '@angular/common/http';

interface User {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  template: `
    <button (click)="userId.set(1)">User 1</button>
    <button (click)="userId.set(2)">User 2</button>

    @if (userResource.isLoading()) {
      <p>Loading...</p>
    } @else if (userResource.error()) {
      <div class="error-box">
        <!-- statusCode(): signal metadata riêng của httpResource -->
        <p>HTTP status: {{ userResource.statusCode() }}</p>
        <p>Message: {{ userResource.error()?.message }}</p>
        <button (click)="userResource.reload()">Retry</button>
      </div>
    } @else if (userResource.hasValue()) {
      <!-- hasValue() trước khi đọc - value() sẽ THROW khi đang error -->
      <h3>{{ userResource.value().name }}</h3>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
  readonly userId = signal(1);

  // URL là hàm reactive: userId đổi -> request MỚI tự bắn, request cũ tự hủy.
  // Không cần loader, không cần switchMap, không cần state tự chế.
  readonly userResource = httpResource<User>(() => `/api/users/${this.userId()}`);

  // Ngoài bộ ResourceRef chuẩn (value/status/error/isLoading/reload/hasValue),
  // httpResource còn có thêm signal metadata HTTP:
  //   userResource.statusCode() - HTTP status code của response
  //   userResource.headers()    - HttpHeaders của response
  //   userResource.progress()   - tiến độ tải (khi bật reportProgress)
}
