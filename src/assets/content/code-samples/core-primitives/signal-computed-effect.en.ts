import {ChangeDetectionStrategy, Component, computed, effect, signal} from '@angular/core';

@Component({
  selector: 'app-example-core-primitives',
  template: `
    <p>Quantity: {{ quantity() }} × Price: {{ price() }} = Total: {{ total() }}</p>
    <button (click)="addQuantity()">Quantity +1</button>
    <button (click)="addPrice()">Price +10,000</button>
    <button (click)="reset()">Reset</button>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExampleCorePrimitivesComponent {
  // 1. signal - ROOT STATE (writable): the data source UI/logic reads from,
  //    only changed via .set() / .update()
  protected readonly quantity = signal(1);
  protected readonly price = signal(50_000);

  // 2. computed - DERIVED STATE (read-only): recomputes when dependencies change,
  //    lazy (only computes when someone reads it) + memoized (no change, no recompute)
  protected readonly total = computed(() => this.quantity() * this.price());

  constructor() {
    // 3. effect - SIDE EFFECT: re-runs when a signal read inside it changes.
    //    Use it to "reach outside": log, localStorage, draw charts, sync DOM...
    //    NOT for creating new state (that's computed's job!)
    effect(() => {
      console.log(`[effect] total = ${this.total()}`);
    });
  }

  addQuantity() {
    // .update(): compute the NEW value from the OLD value
    this.quantity.update((q) => q + 1);
  }

  addPrice() {
    this.price.update((p) => p + 10_000);
  }

  reset() {
    // .set(): assign the new value directly
    this.quantity.set(1);
    this.price.set(50_000);
  }
}
