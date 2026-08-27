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

  // Simulates this.http.get<User>('/api/user') - takes 1s for the server to respond
  // Without share(): Unicast (Cold)
  readonly user$: Observable<User> = defer(() => {
    console.log(`Sending HTTP request #${++this.requestCount} to the server...`);
    return of({ id: 1, name: 'K-Sample' }).pipe(delay(1000));
  });
}

@Component({
  selector: 'app-user-profile',
  imports: [AsyncPipe],
  template: `
    <!-- 2 async pipes = 2 subscriptions => 2 DUPLICATE HTTP requests sent -->
    <h4>Name: {{ (userService.user$ | async)?.name }}</h4>
    <p>ID: {{ (userService.user$ | async)?.id }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfile {
  protected readonly userService = inject(UserService);
}
