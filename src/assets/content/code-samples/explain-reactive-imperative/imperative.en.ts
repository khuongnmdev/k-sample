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

  // The SAME login() event - handled the Imperative way:
  // update each variable by hand, then you MUST REMEMBER to call the recompute function
  protected login() {
    this.isLoggedIn = true;
    this.userRole = 'admin';
    this.updateDeleteButton(); // Forget this line and the UI is instantly wrong!
  }

  // Derived logic must be called manually at EVERY place that changes the state
  private updateDeleteButton() {
    this.showDeleteButton = this.isLoggedIn && this.userRole === 'admin';
  }
}
