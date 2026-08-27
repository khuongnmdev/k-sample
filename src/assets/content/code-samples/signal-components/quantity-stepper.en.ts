import {ChangeDetectionStrategy, Component, input, model, output} from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  standalone: true,
  template: `
    <b>{{ label() }}</b>
    <button (click)="decrease()">-</button>
    <span>{{ quantity() }}</span>
    <button (click)="increase()">+</button>
    <small>(max {{ max() }})</small>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuantityStepper {
  // 1. input(): parent -> child data, a READ-ONLY signal.
  //    .required = must be provided, checked at COMPILE time
  readonly label = input.required<string>();
  readonly max = input(5); // input with a default value

  // 2. model(): WRITABLE signal input - receives a value from the parent,
  //    and can .set()/.update() back. Auto-emits a "quantityChange" event
  //    -> the parent binds two-way with [(quantity)]
  readonly quantity = model(1);

  // 3. output(): child -> parent event. No EventEmitter needed,
  //    auto cleanup when the component is destroyed
  readonly reachedMax = output<number>();

  increase() {
    if (this.quantity() >= this.max()) {
      this.reachedMax.emit(this.quantity());
      return;
    }
    // Write into the model -> the value flows back up to the PARENT's signal
    this.quantity.update((q) => q + 1);
  }

  decrease() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }
}
