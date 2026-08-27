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
  // Represent the input state as data streams
  protected isLoggedIn$ = new BehaviorSubject<boolean>(false);
  protected userRole$ = new BehaviorSubject<string>('guest');

  // Derived logic is declared exactly ONCE (Declarative)
  protected showDeleteButton$ = combineLatest([this.isLoggedIn$, this.userRole$]).pipe(
    map(([isLoggedIn, role]) => isLoggedIn && role === 'admin'),
  );

  // The SAME login() event - handled the Reactive way with RxJS:
  // push new values into the streams, showDeleteButton$ emits the new result automatically
  protected login() {
    this.isLoggedIn$.next(true);
    this.userRole$.next('admin');
  }
}
