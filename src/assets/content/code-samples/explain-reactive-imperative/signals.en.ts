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

  // Derived logic is declared exactly ONCE (Declarative)
  // computed automatically tracks its dependencies on isLoggedIn and userRole
  protected showDeleteButton = computed(() => this.isLoggedIn() && this.userRole() === 'admin');

  // The SAME login() event - handled the Reactive way:
  // just update the source state, the result recomputes automatically
  protected login() {
    this.isLoggedIn.set(true);
    this.userRole.set('admin');
    // Done! showDeleteButton updates automatically, impossible to forget
  }
}
