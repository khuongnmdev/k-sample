import {ChangeDetectionStrategy, Component, resource, signal} from '@angular/core';

interface DemoUser {
  name: string;
  code: string;
}

const FAKE_DB: Record<number, DemoUser> = {
  1: {name: 'Tèo', code: 'A'},
  2: {name: 'Tý', code: 'B'},
  3: {name: 'Na', code: 'C'},
};

@Component({
  selector: 'app-resource-user',
  template: `
    <button (click)="userId.set(1)">User 1</button>
    <button (click)="userId.set(2)">User 2</button>
    <button (click)="userId.set(3)">User 3</button>
    <button (click)="userId.set(404)">User 404 (error)</button>
    <button (click)="user.reload()">reload()</button>

    <p>status(): {{ user.status() }} - isLoading(): {{ user.isLoading() }}</p>

    @if (user.isLoading()) {
      <p>Loading user {{ userId() }}...</p>
    } @else if (user.error()) {
      <p>error(): {{ user.error()?.message }}</p>
    } @else if (user.hasValue()) {
      <p>value(): user {{ user.value().name }} - code {{ user.value().code }}</p>
    }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceUserComponent {
  // params: the input signal - change its value and the loader re-runs AUTOMATICALLY
  readonly userId = signal(1);

  // resource: "async data as a signal"
  readonly user = resource({
    // 1. params: a reactive function - resource tracks every signal read inside
    params: () => this.userId(),

    // 2. loader: receives {params, abortSignal}, returns a Promise
    loader: ({params: id, abortSignal}) => this.fetchUser(id, abortSignal),
  });

  // Simulate an API (~800ms); unknown id -> reject to demo the error state
  private fetchUser(id: number, abortSignal: AbortSignal): Promise<DemoUser> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const found = FAKE_DB[id];
        if (found) {
          resolve(found);
        } else {
          reject(new Error(`No user found with id = ${id}`));
        }
      }, 800);

      // Params change / destroy -> Angular aborts the old request via abortSignal
      abortSignal.addEventListener('abort', () => clearTimeout(timer));
    });
  }

  // What resource provides - ALL of them are signals:
  // user.value()     - the data (THROWS while in the error state)
  // user.status()    - 'idle' | 'loading' | 'reloading' | 'resolved' | 'error' | 'local'
  // user.error()     - Error | undefined
  // user.isLoading() - true while loading/reloading
  // user.hasValue()  - type guard to read value safely
  // user.reload()    - re-run the loader with the current params
}
