import { ChangeDetectionStrategy, Component, effect, signal } from '@angular/core';

interface User {
  name: string;
  age: number;
}

@Component({
  selector: 'app-custom-equality-demo',
  template: `
    <button (click)="refreshSameContent()">Server returns identical data (new ref)</button>
    <button (click)="increaseAge()">Increase age (+1)</button>
    <p>default signal notify: {{ defaultNotifyCount() }}</p>
    <p>signal with equal notify: {{ smartNotifyCount() }}</p>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomEqualityDemo {
  // Default comparison is Object.is: for objects that means REFERENCE comparison
  // -> a NEW object with the same content is still considered "changed"
  readonly defaultUser = signal<User>({ name: 'Tèo', age: 20 });

  // Custom equal: compare by CONTENT
  // -> identical content stays silent, nobody gets notified
  readonly smartUser = signal<User>(
    { name: 'Tèo', age: 20 },
    { equal: (a, b) => a.name === b.name && a.age === b.age },
  );

  // The demo's "counters": each effect READS a signal - just reading makes the effect
  // depend on that signal. Signal notifies -> effect reruns -> counter +1.
  // Both start at 1 because an effect always runs once on initialization.
  readonly defaultNotifyCount = signal(0);
  readonly smartNotifyCount = signal(0);

  constructor() {
    effect(() => {
      this.defaultUser();
      this.defaultNotifyCount.update((c) => c + 1);
    });
    effect(() => {
      this.smartUser();
      this.smartNotifyCount.update((c) => c + 1);
    });
    // Note: the effects here only do MEASUREMENT for the demo (like logging) - that's valid.
    // Don't use effect to COMPUTE state from another signal - that's computed's job.
  }

  // Button 1: simulate the server returning IDENTICAL DATA but as a new object (new reference)
  // -> defaultUser notifies (REDUNDANT - useless rerender/recompute), smartUser stays silent thanks to equal
  refreshSameContent() {
    this.defaultUser.set({ ...this.defaultUser() });
    this.smartUser.set({ ...this.smartUser() });
  }

  // Button 2: content really changes -> BOTH notify (equal returns false)
  increaseAge() {
    this.defaultUser.update((u) => ({ ...u, age: u.age + 1 }));
    this.smartUser.update((u) => ({ ...u, age: u.age + 1 }));
  }

  // The OPPOSITE trap to remember: mutate in place then set the SAME reference
  //   const u = this.defaultUser();
  //   u.age = 99;
  //   this.defaultUser.set(u); // same ref -> Object.is says "unchanged" -> UI STAYS FROZEN!
  // The right way: always update immutably like increaseAge() above.

  // computed accepts the exact same equal:
  //   readonly total = computed(() => ({ ... }), { equal: (a, b) => a.sum === b.sum });
}
