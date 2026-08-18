import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { defer, delay, Observable, of, share } from 'rxjs';

interface User {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private requestCount = 0;

  // Giả lập this.http.get<User>('/api/user') - mất 1s để server phản hồi
  readonly user$: Observable<User> = defer(() => {
    console.log(`Gửi HTTP request lần thứ ${++this.requestCount} tới server...`);
    return of({ id: 1, name: 'K-Sample' }).pipe(delay(1000));
  }).pipe(
    share(), // Multicast: các subscriber chia sẻ CHUNG 1 request duy nhất
    // Dùng shareReplay(1) nếu muốn subscriber muộn nhận lại kết quả đã cache
  );
}

@Component({
  selector: 'app-user-profile',
  imports: [AsyncPipe],
  template: `
    <!-- 2 async pipe = 2 lượt subscribe nhưng chỉ 1 HTTP request được gửi đi -->
    <h4>Tên: {{ (userService.user$ | async)?.name }}</h4>
    <p>ID: {{ (userService.user$ | async)?.id }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfile {
  protected readonly userService = inject(UserService);
}
