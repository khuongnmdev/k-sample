import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { defer, delay, Observable, of } from 'rxjs';

interface User {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private requestCount = 0;

  // Giả lập this.http.get<User>('/api/user') - mất 1s để server phản hồi
  // Không có share(): Unicast (Cold)
  readonly user$: Observable<User> = defer(() => {
    console.log(`Gửi HTTP request lần thứ ${++this.requestCount} tới server...`);
    return of({ id: 1, name: 'K-Sample' }).pipe(delay(1000));
  });
}

@Component({
  selector: 'app-user-profile',
  imports: [AsyncPipe],
  template: `
    <!-- 2 async pipe = 2 lượt subscribe => gửi 2 HTTP request TRÙNG LẶP -->
    <h4>Tên: {{ (userService.user$ | async)?.name }}</h4>
    <p>ID: {{ (userService.user$ | async)?.id }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfile {
  protected readonly userService = inject(UserService);
}
