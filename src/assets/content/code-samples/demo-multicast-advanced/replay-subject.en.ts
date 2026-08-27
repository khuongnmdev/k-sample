import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  // ReplaySubject(3): YOU emit values yourself via .next(), no cold source needed behind it.
  // Late subscribers (a toast component that mounts later) still get the 3 most recent notifications.
  private readonly _notifications$ = new ReplaySubject<string>(3);

  // Hide the subject behind asObservable() - outsiders may only listen, never .next()
  readonly notifications$ = this._notifications$.asObservable();

  push(message: string) {
    this._notifications$.next(message);
  }

  // A ReplaySubject never completes on its own - you manage its lifecycle.
  // A providedIn root service lives as long as the app, no manual complete needed.
}
