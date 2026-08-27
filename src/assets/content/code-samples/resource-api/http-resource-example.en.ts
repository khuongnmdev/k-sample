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
        <!-- statusCode(): metadata signal specific to httpResource -->
        <p>HTTP status: {{ userResource.statusCode() }}</p>
        <p>Message: {{ userResource.error()?.message }}</p>
        <button (click)="userResource.reload()">Retry</button>
      </div>
    } @else if (userResource.hasValue()) {
      <!-- hasValue() before reading - value() will THROW while in the error state -->
      <h3>{{ userResource.value().name }}</h3>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailComponent {
  readonly userId = signal(1);

  // The URL is a reactive function: userId changes -> a NEW request fires, the old one is cancelled.
  // No loader, no switchMap, no hand-made state.
  readonly userResource = httpResource<User>(() => `/api/users/${this.userId()}`);

  // Beyond the standard ResourceRef set (value/status/error/isLoading/reload/hasValue),
  // httpResource adds HTTP metadata signals:
  //   userResource.statusCode() - HTTP status code of the response
  //   userResource.headers()    - HttpHeaders of the response
  //   userResource.progress()   - download progress (when reportProgress is on)
}
